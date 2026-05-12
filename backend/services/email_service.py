from __future__ import annotations

import logging
import os
import smtplib
import time
from pathlib import Path
from email.message import EmailMessage
from typing import Any, Dict, Optional

try:
    from jinja2 import Environment, FileSystemLoader, TemplateNotFound, select_autoescape
except Exception:  # pragma: no cover - optional dependency runtime fallback
    Environment = None  # type: ignore
    FileSystemLoader = None  # type: ignore
    TemplateNotFound = Exception  # type: ignore
    select_autoescape = None  # type: ignore

from database.supabase_client import _bootstrap_backend_env

logger = logging.getLogger(__name__)

_TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "templates" / "emails"
_jinja = (
    Environment(
        loader=FileSystemLoader(str(_TEMPLATE_DIR)),
        autoescape=select_autoescape(enabled_extensions=("html", "xml")),
    )
    if Environment and FileSystemLoader and select_autoescape
    else None
)


def _env(name: str, default: str = "") -> str:
    _bootstrap_backend_env()
    return os.getenv(name, default).strip()


def _smtp_config() -> Dict[str, str]:
    # Support both preferred names and legacy aliases used in local env files.
    password = (
        _env("POSTMARK_SMTP_TOKEN")
        or _env("POSTMARK_SERVER_TOKEN")
        or _env("POSTMARK_SMTP_SECRET_KEY")
        or _env("POSTMARK_SMTP_Secret_key")
    )
    if not password:
        raise RuntimeError(
            "Missing SMTP password env var. Set POSTMARK_SMTP_TOKEN "
            "(or POSTMARK_SERVER_TOKEN / POSTMARK_SMTP_SECRET_KEY)."
        )
    username = (
        _env("POSTMARK_SMTP_USERNAME")
        or _env("POSTMARK_SMTP_ACCESS_KEY")
        or _env("POSTMARK_SMTP_Access_Key")
        or password
    )
    return {
        "host": _env("POSTMARK_SMTP_HOST", "smtp.postmarkapp.com"),
        "port": _env("POSTMARK_SMTP_PORT", "587") or "587",
        "username": username,
        "password": password,
    }


def render_email_template(template_name: str, context: Dict[str, Any]) -> str:
    if _jinja is None:
        # Fallback keeps backend running when jinja2 is not installed yet.
        return (
            f"<html><body><h3>IndustryPrime</h3><p>Template: {template_name}</p>"
            f"<pre>{context}</pre><p>Sent by IndustryPrime · aman@industryprime.com</p></body></html>"
        )
    try:
        tpl = _jinja.get_template(template_name)
    except TemplateNotFound as exc:
        raise RuntimeError(f"Missing email template: {template_name}") from exc
    return tpl.render(**context)


def send_email(to: str | list[str], subject: str, html: str, text: Optional[str] = None) -> None:
    recipients: list[str]
    if isinstance(to, str):
        recipients = [to.strip()]
    else:
        recipients = [str(addr).strip() for addr in to if str(addr).strip()]
    if not recipients:
        raise RuntimeError("send_email requires at least one recipient")

    sender = _env("POSTMARK_FROM_EMAIL", "aman@industryprime.com")
    stream = _env("POSTMARK_MESSAGE_STREAM", "outbound")
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = ", ".join(recipients)
    msg["X-PM-Message-Stream"] = stream
    msg.set_content(text or "This email requires an HTML-capable client.")
    msg.add_alternative(html, subtype="html")

    attempts = 2
    last_exc: Optional[Exception] = None
    for i in range(attempts):
        try:
            conf = _smtp_config()
            with smtplib.SMTP(conf["host"], int(conf["port"]), timeout=20) as smtp:
                smtp.ehlo()
                smtp.starttls()
                smtp.ehlo()
                smtp.login(conf["username"], conf["password"])
                smtp.send_message(msg)
            logger.info("Postmark SMTP email sent subject=%s to=%s stream=%s", subject, recipients, stream)
            return
        except Exception as exc:
            last_exc = exc
            exc_text = str(exc).lower()
            transient = "timeout" in exc_text or "temporar" in exc_text or "try again" in exc_text
            if i < attempts - 1 and transient:
                time.sleep(0.6)
                continue
            raise

    if last_exc:
        raise last_exc
