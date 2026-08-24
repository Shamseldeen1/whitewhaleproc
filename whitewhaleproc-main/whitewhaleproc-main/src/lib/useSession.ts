"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { SessionUser } from "@/lib/auth";

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  useEffect(() => {
    apiGet<SessionUser>("/api/auth/me").then(setUser).catch(() => {});
  }, []);
  return user;
}
