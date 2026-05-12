"""Smoke tests for public endpoints (no DB, no auth)."""

from __future__ import annotations

from starlette.testclient import TestClient


def test_root(client: TestClient) -> None:
    r = client.get("/")
    assert r.status_code == 200
    assert "message" in r.json()


def test_health(client: TestClient) -> None:
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"
