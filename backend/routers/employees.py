from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Header, HTTPException, Query

from dependencies.auth_dependency import get_auth_context
from database.supabase_client import get_supabase_user
from schemas.employees import (
    EmployeeAllowancesSelfUpdate,
    EmployeeCreate,
    EmployeeOut,
    EmployeeUpdate,
)
from services.employees_service import create_employee, list_employees, update_employee
from services.auth_service import require_role

router = APIRouter()


@router.get("", response_model=List[EmployeeOut])
def get_employees(
    status: Optional[str] = Query(default="active"),
    authorization: Optional[str] = Header(default=None),
):
    if not authorization:
        return []

    auth = get_auth_context(authorization=authorization)
    rows = list_employees(
        status=status,
        tenant_id=auth.tenant_id,
        supabase=get_supabase_user(auth.access_token),
    )
    if auth.role not in {"master_admin", "admin"}:
        rows = [row for row in rows if str(row.get("email") or "").strip().lower() == auth.email.strip().lower()]
    return [EmployeeOut(**{**r, "id": str(r.get("id", ""))}) for r in rows]


@router.post("", response_model=EmployeeOut)
def post_employee(
    body: EmployeeCreate,
    authorization: Optional[str] = Header(default=None),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization bearer token")

    auth = get_auth_context(authorization=authorization)
    require_role({"role": auth.role}, "master_admin", "admin")
    row = create_employee(
        {
            "name": body.name.strip(),
            "at_div_code": body.at_div_code.strip(),
            "email": (body.email.strip() if body.email else None),
            "department": body.department,
            "designation": body.designation,
            "salary_monthly": body.salary_monthly,
            "professional_tax": body.professional_tax,
            "pf_employee_monthly": body.pf_employee_monthly,
            "income_tax_tds_monthly": body.income_tax_tds_monthly,
            "hra_monthly": body.hra_monthly,
            "conveyance_monthly": body.conveyance_monthly,
            "special_allowance_monthly": body.special_allowance_monthly,
        },
        supabase=get_supabase_user(auth.access_token),
    )
    if not row.get("id"):
        raise HTTPException(status_code=400, detail="Failed to create employee")
    return EmployeeOut(**{**row, "id": str(row["id"])})


@router.patch("/{employee_id}/allowances", response_model=EmployeeOut)
def patch_employee_allowances(
    employee_id: str,
    body: EmployeeAllowancesSelfUpdate,
    authorization: Optional[str] = Header(default=None),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization bearer token")

    auth = get_auth_context(authorization=authorization)
    supabase = get_supabase_user(auth.access_token)
    rows = supabase.select(table="employees", select="*", where_eq={"id": employee_id}, limit=1)
    if not rows:
        raise HTTPException(status_code=404, detail="Employee not found")
    emp = rows[0]
    emp_email = str(emp.get("email") or "").strip().lower()
    is_admin = auth.role in {"master_admin", "admin"}
    if not is_admin and emp_email != auth.email.strip().lower():
        raise HTTPException(status_code=403, detail="You can only update your own pay components")

    payload = body.model_dump(exclude_unset=True)
    for key in list(payload.keys()):
        if key not in {"hra_monthly", "conveyance_monthly", "special_allowance_monthly"}:
            del payload[key]
    if not payload:
        raise HTTPException(status_code=400, detail="No allowed fields to update")

    row = update_employee(employee_id, payload, supabase=supabase)
    if not row.get("id"):
        raise HTTPException(status_code=404, detail="Employee not found")
    return EmployeeOut(**{**row, "id": str(row["id"])})


@router.patch("/{employee_id}", response_model=EmployeeOut)
def patch_employee(
    employee_id: str,
    body: EmployeeUpdate,
    authorization: Optional[str] = Header(default=None),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization bearer token")

    auth = get_auth_context(authorization=authorization)
    require_role({"role": auth.role}, "master_admin", "admin")
    row = update_employee(
        employee_id,
        {
            "name": body.name.strip(),
            "at_div_code": body.at_div_code.strip(),
            "email": (body.email.strip() if body.email else None),
            "department": body.department,
            "designation": body.designation,
            "salary_monthly": body.salary_monthly,
            "professional_tax": body.professional_tax,
            "pf_employee_monthly": body.pf_employee_monthly,
            "income_tax_tds_monthly": body.income_tax_tds_monthly,
            "hra_monthly": body.hra_monthly,
            "conveyance_monthly": body.conveyance_monthly,
            "special_allowance_monthly": body.special_allowance_monthly,
        },
        supabase=get_supabase_user(auth.access_token),
    )
    if not row.get("id"):
        raise HTTPException(status_code=404, detail="Employee not found")
    return EmployeeOut(**{**row, "id": str(row["id"])})

