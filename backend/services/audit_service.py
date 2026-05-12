from __future__ import annotations

from typing import Any, Dict, Optional

from database.supabase_client import SupabaseRest


def record_audit_event(
    supabase: SupabaseRest,
    *,
    actor_email: Optional[str],
    action: str,
    target_id: Optional[str],
    metadata: Optional[Dict[str, Any]] = None,
) -> None:
    try:
        supabase.insert_many(
            table="audit_events",
            rows=[
                {
                    "actor_email": actor_email,
                    "action": action,
                    "target_id": target_id,
                    "metadata": metadata or {},
                }
            ],
            return_representation=False,
        )
    except Exception:
        # Do not fail business action if audit table is not migrated yet.
        return
