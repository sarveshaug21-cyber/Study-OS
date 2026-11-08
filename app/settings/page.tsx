import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SettingsForm } from "@/components/settings-form";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your Study OS profile, study preferences and privacy.",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Personalise your study defaults and reminders. This demo stores changes in memory only."
        actions={
          <Link href="/" className="btn-secondary">
            <ArrowLeft aria-hidden="true" size={16} />
            Back to dashboard
          </Link>
        }
      />

      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-900">
        <ShieldCheck aria-hidden="true" size={18} className="mt-0.5 shrink-0" />
        <p className="leading-6">
          You are in a temporary demo workspace. No personal data is saved, no
          database is connected, and no information leaves your browser.
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}
