import { PageHeader } from "@/components/page-header";
import { CloudFiles } from "@/components/cloud-files";
export const metadata = { title: "Cloud Files (Google Drive)" };
export default function CloudFilesPage() {
  return (<div className="space-y-6"><PageHeader eyebrow="Files" title="Cloud Files" description="Google Drive is the primary file store. Supabase holds metadata only. Connect your Google account first." /><CloudFiles /></div>);
}
