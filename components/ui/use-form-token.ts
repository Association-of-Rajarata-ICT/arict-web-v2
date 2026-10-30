"use client";

import { useEffect, useState } from "react";
import { getFormToken } from "@/actions/public";

/** Fetches a signed form-start token once the form is on screen (anti-spam timing check). */
export function useFormToken() {
  const [token, setToken] = useState("");
  useEffect(() => {
    let cancelled = false;
    getFormToken()
      .then((t) => !cancelled && setToken(t))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return token;
}
