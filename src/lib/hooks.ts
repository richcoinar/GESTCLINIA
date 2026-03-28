"use client";

import { useEffect, useState } from "react";
import { createClient } from "./supabase/client";

export type UserRole = "super_admin" | "clinic_admin" | "user" | null;

interface AuthState {
  user: { id: string; email: string } | null;
  role: UserRole;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (!user || !user.email) {
        setState({ user: null, role: null, loading: false });
        return;
      }

      // Check if user is a gestclinia super admin
      const { data: adminData } = await supabase
        .from("gestclinia_admins")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      if (cancelled) return;

      if (adminData) {
        setState({
          user: { id: user.id, email: user.email },
          role: "super_admin",
          loading: false,
        });
        return;
      }

      // Check if user is a clinic admin
      const { data: clinicAdmin } = await supabase
        .from("clinics")
        .select("id")
        .eq("admin_id", user.id)
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      setState({
        user: { id: user.id, email: user.email },
        role: clinicAdmin ? "clinic_admin" : "user",
        loading: false,
      });
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

// Super admin protected emails
export const PROTECTED_ADMIN_EMAILS = [
  "richcoinar@gmail.com",
  "ricardocguzmansj@gmail.com",
];
