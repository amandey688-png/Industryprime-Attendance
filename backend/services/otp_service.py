from __future__ import annotations

import secrets
import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from fastapi import HTTPException, status

from database.supabase_client import SupabaseRest
from services.email_service import (
    MISSING_POSTMARK_ON_API_HOST_MESSAGE,
    render_email_template,
    send_email,
)
from services.auth_service import _jwt_secret

try:
    import bcrypt  # type: ignore
except Exception:  # pragma: no cover - runtime fallback for environments without bcrypt wheels
    bcrypt = None

OTP_TTL_MINUTES = 10
OTP_MAX_ATTEMPTS = 5
OTP_MAX_SENDS_PER_HOUR = 5


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _normalize_email(email: str) -> str:
    return str(email or "").strip().lower()


def _generate_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def _bcrypt_hash(raw: str) -> str:
    if bcrypt is not None:
        return "bcrypt$" + bcrypt.hashpw(raw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    # Fallback for Python envs where bcrypt wheel/build isn't available (e.g. 3.14 on Windows).
    salt = secrets.token_hex(16)
    digest = hashlib.sha256((_jwt_secret() + "|" + salt + "|" + raw).encode("utf-8")).hexdigest()
    return f"sha256${salt}${digest}"


def _bcrypt_verify(raw: str, hashed: str) -> bool:
    try:
        if hashed.startswith("bcrypt$"):
            if bcrypt is None:
                return False
            inner = hashed.split("$", 1)[1]
            return bcrypt.checkpw(raw.encode("utf-8"), inner.encode("utf-8"))
        if hashed.startswith("sha256$"):
            _, salt, digest = hashed.split("$", 2)
            actual = hashlib.sha256((_jwt_secret() + "|" + salt + "|" + raw).encode("utf-8")).hexdigest()
            return hmac.compare_digest(actual, digest)
        # Backward compatibility if old rows store raw bcrypt string without prefix.
        if bcrypt is not None:
            return bcrypt.checkpw(raw.encode("utf-8"), hashed.encode("utf-8"))
        return False
    except Exception:
        return False


def _assert_send_rate_limit(supabase: SupabaseRest, email: str, purpose: str) -> None:
    since = (_now_utc() - timedelta(hours=1)).isoformat()
    rows = supabase.select(
        table="otp_codes",
        select="id",
        where_eq={"email": email, "purpose": purpose},
        where_gte={"created_at": since},
        limit=OTP_MAX_SENDS_PER_HOUR + 1,
    )
    if len(rows) >= OTP_MAX_SENDS_PER_HOUR:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many OTP sends. Try again in a while.",
        )


def issue_otp(
    supabase: SupabaseRest,
    *,
    email: str,
    purpose: str,
    subject: str,
) -> None:
    clean_email = _normalize_email(email)
    if purpose not in {"signup", "login"}:
        raise HTTPException(status_code=400, detail="Invalid OTP purpose")
    _assert_send_rate_limit(supabase, clean_email, purpose)
    code = _generate_code()
    exp = _now_utc() + timedelta(minutes=OTP_TTL_MINUTES)
    supabase.insert_many(
        table="otp_codes",
        rows=[
            {
                "email": clean_email,
                "purpose": purpose,
                "code_hash": _bcrypt_hash(code),
                "expires_at": exp.isoformat(),
            }
        ],
        return_representation=False,
    )

    html = render_email_template(
        "otp_email.html",
        {"email": clean_email, "code": code, "purpose": purpose, "minutes": OTP_TTL_MINUTES},
    )
    text = f"Your IndustryPrime {purpose} code is {code}. It expires in {OTP_TTL_MINUTES} minutes."
    if not send_email(clean_email, subject=subject, html=html, text=text):
        raise RuntimeError(MISSING_POSTMARK_ON_API_HOST_MESSAGE)


def verify_latest_otp(supabase: SupabaseRest, *, email: str, purpose: str, code: str) -> Dict[str, Any]:
    clean_email = _normalize_email(email)
    rows = supabase.select(
        table="otp_codes",
        select="id,email,purpose,code_hash,expires_at,consumed_at,attempt_count,created_at",
        where_eq={"email": clean_email, "purpose": purpose},
        order="created_at.desc",
        limit=1,
    )
    if not rows:
        raise HTTPException(status_code=400, detail="No OTP issued. Please request a new code.")
    otp = rows[0]
    otp_id = str(otp["id"])
    if otp.get("consumed_at"):
        raise HTTPException(status_code=400, detail="OTP already used. Please request a new code.")
    exp = datetime.fromisoformat(str(otp["expires_at"]).replace("Z", "+00:00"))
    if exp < _now_utc():
        raise HTTPException(status_code=400, detail="OTP expired. Please request a new code.")
    attempts = int(otp.get("attempt_count") or 0)
    if attempts >= OTP_MAX_ATTEMPTS:
        raise HTTPException(status_code=400, detail="OTP locked. Please request a new code.")
    if not _bcrypt_verify(code.strip(), str(otp.get("code_hash") or "")):
        supabase.update_single(
            table="otp_codes",
            payload={"attempt_count": attempts + 1},
            where_eq={"id": otp_id},
        )
        raise HTTPException(status_code=400, detail="Invalid OTP code.")
    used = _now_utc().isoformat()
    supabase.update_single(
        table="otp_codes",
        payload={"consumed_at": used},
        where_eq={"id": otp_id},
    )
    otp["consumed_at"] = used
    return otp
