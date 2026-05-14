"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import type { AuthUser } from "@/lib/auth";
import { fetchMeProfile } from "@/lib/api/me";

export type SessionUser = Pick<AuthUser, "id" | "name" | "email" | "role"> & {
  shift?: string | null;
  location?: string | null;
  joinedAt?: string | null;
};

export function useSession(): { user: SessionUser | null } {
  const [user, setUser] = useState<Pick<AuthUser, "id" | "name" | "email" | "role"> | null>(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("industryprime.authUser") : null;
      if (!raw) return null;
      const u = JSON.parse(raw) as AuthUser;
      return { id: u.id, name: u.name, email: u.email, role: u.role };
    } catch {
      return null;
    }
  });

  const sync = useCallback(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("industryprime.authUser") : null;
      if (!raw) {
        setUser(null);
        return;
      }
      const u = JSON.parse(raw) as AuthUser;
      setUser({ id: u.id, name: u.name, email: u.email, role: u.role });
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("industryprime-auth-change", sync);
    return () => window.removeEventListener("industryprime-auth-change", sync);
  }, [sync]);

  const profileQ = useQuery({
    queryKey: ["me-profile", user?.id],
    queryFn: fetchMeProfile,
    enabled: !!user && user.role === "user",
    staleTime: 300_000,
  });

  if (!user) return { user: null };
  if (user.role !== "user") {
    return { user: { ...user, shift: null, location: null, joinedAt: null } };
  }
  return {
    user: {
      ...user,
      shift: profileQ.data?.shift ?? null,
      location: profileQ.data?.location ?? null,
      joinedAt: profileQ.data?.joinedAt ?? null,
    },
  };
}
