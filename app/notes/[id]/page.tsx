import type { Metadata } from "next";
import { NoteDetail } from "@/components/note-detail";

export const metadata: Metadata = {
  title: "Note",
  description: "Read a revision note.",
};

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <NoteDetail id={id} />;
}
