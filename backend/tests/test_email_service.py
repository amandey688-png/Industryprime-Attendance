import pytest

from services import email_service


def test_send_email_log_mode_skips_postmark(monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture) -> None:
    monkeypatch.setenv("EMAIL_MODE", "log")
    # Ensure no token (would fail if Postmark path ran).
    for k in (
        "POSTMARK_SERVER_TOKEN",
        "POSTMARK_SMTP_TOKEN",
        "POSTMARK_SMTP_SECRET_KEY",
        "POSTMARK_SMTP_Secret_key",
    ):
        monkeypatch.delenv(k, raising=False)
    caplog.set_level("INFO")
    assert email_service.send_email(
        to="approver@example.com",
        subject="Leave test",
        html="<p>hello</p>",
        text="hello",
    ) is True
    assert email_service.email_delivery_mode() == "log"
    assert any("EMAIL_MODE=log" in r.message for r in caplog.records)
    assert any("approver@example.com" in r.message for r in caplog.records)


def test_postmark_token_accepts_access_key_alias(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("POSTMARK_SERVER_TOKEN", raising=False)
    monkeypatch.delenv("POSTMARK_SMTP_TOKEN", raising=False)
    monkeypatch.setenv("POSTMARK_Access_Key", "test-server-token-value")
    assert email_service.postmark_token_configured()
    monkeypatch.setenv("EMAIL_MODE", "local")
    assert email_service.email_delivery_mode() == "log"
    monkeypatch.setenv("EMAIL_MODE", "postmark")
    assert email_service.email_delivery_mode() == "postmark"


def test_send_email_without_postmark_token_returns_false(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    monkeypatch.setenv("EMAIL_MODE", "postmark")
    for k in (
        "POSTMARK_SERVER_TOKEN",
        "POSTMARK_SMTP_TOKEN",
        "POSTMARK_SMTP_SECRET_KEY",
        "POSTMARK_SMTP_Secret_key",
    ):
        monkeypatch.delenv(k, raising=False)
    caplog.set_level("WARNING")
    ok = email_service.send_email(
        to="x@example.com",
        subject="Hi",
        html="<p>a</p>",
        text="a",
    )
    assert ok is False
    assert any("Postmark token not set" in r.message for r in caplog.records)
