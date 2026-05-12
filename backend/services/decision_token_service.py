from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time
from typing import Any, Dict

from database.supabase_client import _bootstrap_backend_env


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode((data + padding).encode("ascii"))


def _secret() -> str:
    _bootstrap_backend_env()
    sec = os.getenv("DECISION_TOKEN_SECRET", "").strip() or os.getenv("JWT_SECRET", "").strip()
    if not sec:
        raise RuntimeError("Missing DECISION_TOKEN_SECRET or JWT_SECRET")
    return sec


def make_decision_token(*, leave_id: str, email: str, action: str, expires_in_seconds: int = 7 * 24 * 3600) -> str:
    payload = {
        "leave_id": leave_id,
        "email": email.strip().lower(),
        "action": action,
        "exp": int(time.time()) + expires_in_seconds,
    }
    body = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    sig = hmac.new(_secret().encode("utf-8"), body.encode("ascii"), hashlib.sha256).digest()
    return f"{body}.{_b64url_encode(sig)}"


def verify_decision_token(token: str) -> Dict[str, Any]:
    try:
        body, sig = token.split(".", 1)
        expected = hmac.new(_secret().encode("utf-8"), body.encode("ascii"), hashlib.sha256).digest()
        got = _b64url_decode(sig)
        if not hmac.compare_digest(expected, got):
            raise ValueError("Bad signature")
        payload = json.loads(_b64url_decode(body))
    except Exception as exc:
        raise ValueError("Invalid decision token") from exc
    if int(payload.get("exp") or 0) < int(time.time()):
        raise ValueError("Decision token expired")
    action = str(payload.get("action") or "")
    if action not in {"approve", "reject"}:
        raise ValueError("Invalid decision action")
    return payload
