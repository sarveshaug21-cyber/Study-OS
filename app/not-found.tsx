import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="card max-w-lg p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Compass aria-hidden="true" size={22} />
        </span>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          This page is not in your study plan
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          The link may be out of date. Head back to the dashboard to pick up
          where you left off.
        </p>
        <Link href="/" className="btn-primary mt-6">
          <ArrowLeft aria-hidden="true" size={16} />
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
