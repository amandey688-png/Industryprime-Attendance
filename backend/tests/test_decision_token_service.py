from services.decision_token_service import make_decision_token, verify_decision_token


def test_decision_token_roundtrip(monkeypatch):
    monkeypatch.setenv("DECISION_TOKEN_SECRET", "test-secret")
    token = make_decision_token(leave_id="leave-1", email="a@b.com", action="approve", expires_in_seconds=60)
    payload = verify_decision_token(token)
    assert payload["leave_id"] == "leave-1"
    assert payload["email"] == "a@b.com"
    assert payload["action"] == "approve"
