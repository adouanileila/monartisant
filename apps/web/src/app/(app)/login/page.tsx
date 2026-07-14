"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  useEffect(() => {
    router.replace(mode === "signup" ? "/?auth=signup" : "/?auth=login");
  }, [mode, router]);

  return null;
}