from __future__ import annotations

from typing import Any, Dict, Optional

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from dependencies.auth_dependency import get_auth_context
from database.supabase_client import get_supabase_user
from services.me_dashboard_service import get_me_dashboard, get_me_profile, save_me_note

router = APIRouter()


def _require_user(authorization: Optional[str]) -> Any:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization bearer token")
    auth = get_auth_context(authorization=authorization)
    if auth.role != "user":
        raise HTTPException(status_code=403, detail="Employee self-service is only for user role accounts.")
    return auth


@router.get("/dashboard", response_model=Dict[str, Any])
def me_dashboard(authorization: Optional[str] = Header(default=None)):
    auth = _require_user(authorization)
    supabase = get_supabase_user(auth.access_token)
    return get_me_dashboard(supabase=supabase, auth_email=auth.email)


@router.get("/profile", response_model=Dict[str, Any])
def me_profile(authorization: Optional[str] = Header(default=None)):
    auth = _require_user(authorization)
    supabase = get_supabase_user(auth.access_token)
    return get_me_profile(supabase=supabase, auth_email=auth.email)


class MeNoteBody(BaseModel):
    note: str = Field(default="", max_length=500)


@router.post("/note", response_model=Dict[str, Any])
def me_note(body: MeNoteBody, authorization: Optional[str] = Header(default=None)):
    auth = _require_user(authorization)
    supabase = get_supabase_user(auth.access_token)
    try:
        saved = save_me_note(supabase=supabase, auth_email=auth.email, note=body.note)
        return {"ok": True, "note": saved or None}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
