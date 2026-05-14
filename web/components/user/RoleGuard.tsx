"use client";

import type { ReactNode } from "react";

import type { AuthUser } from "@/lib/auth";

export function RoleGuard({
  allow,
  role,
  children,
  fallback,
}: {
  allow: Array<NonNullable<AuthUser["role"]>>;
  role: AuthUser["role"] | null | undefined;
  children: ReactNode;
  fallback: ReactNode;
}) {
  if (!role || !allow.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}

export function UnauthorizedEmployeeView() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-[#E5EAE8] bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold text-[#E04F4F]">Access denied</p>
      <h1 className="mt-2 text-xl font-semibold text-[#0F1F1B]">Employee dashboard</h1>
      <p className="mt-2 text-sm text-[#7A8784]">This page is only for accounts with the User role.</p>
    </div>
  );
}
