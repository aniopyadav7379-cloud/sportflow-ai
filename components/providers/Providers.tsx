"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { SWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <SWRConfig value={{ fetcher, revalidateOnFocus: false, shouldRetryOnError: false }}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontSize: "13px",
              borderRadius: "10px",
              background: "var(--toast-bg, #fff)",
            },
          }}
        />
      </SWRConfig>
    </ThemeProvider>
  );
}
