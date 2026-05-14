"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getStoredUser } from "@/lib/auth";

/** Employees must not stay on admin routes; send them to their dashboard. */
export default function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (getStoredUser()?.role === "user") {
      router.replace("/dashboard/user");
    }
  }, [router, pathname]);

  return <>{children}</>;
}
