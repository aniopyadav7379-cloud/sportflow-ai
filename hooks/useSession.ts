"use client";

import useSWR from "swr";

export type Session = { id: string; name: string; email: string; role: string };

export function useSession() {
  const { data, error, isLoading, mutate } = useSWR<Session>("/api/auth/me", {
    shouldRetryOnError: false,
  });
  return { session: data, isLoading, isError: !!error, mutate };
}
