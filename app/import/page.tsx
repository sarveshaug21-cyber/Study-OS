import { PageHeader } from "@/components/page-header";
export const metadata = { title: "Import (admin)" };
export default function ImportPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Official content import" description="Dry-run preview only. No database writes occur here. Requires ADMIN_EMAILS." />
      <section className="card p-5">
        <p className="text-sm text-ink-muted">POST a JSON body to /api/import/preview. The body should contain a records array and an existing array. The response shows new, duplicate and invalid records with validation errors. Live import requires explicit approval and is not enabled in this build.</p>
      </section>
    </div>
  );
}
