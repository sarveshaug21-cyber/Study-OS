import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: {
    default: "Study OS — Your revision command centre",
    template: "%s · Study OS",
  },
  description:
    "A polished, responsive study workspace for GCSE, International GCSE, A-level and International A-level students across AQA, Pearson Edexcel, OCR, WJEC, Eduqas and CCEA.",
  applicationName: "Study OS",
  keywords: [
    "Study OS",
    "revision",
    "GCSE",
    "A-level",
    "AQA",
    "Pearson Edexcel",
    "OCR",
    "WJEC",
    "Eduqas",
    "CCEA",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0B1220",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
