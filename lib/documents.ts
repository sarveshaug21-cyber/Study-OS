// Text-document extraction inspired by AI File Organizer's extractors.py,
// ported to a small browser-safe TypeScript module (no new deps).
export function extractTextFromFile(file: File): Promise<{ text: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => resolve({ text: String(reader.result ?? ""), mime: file.type || "text/plain" });
    if (file.type.startsWith("text/") || /\.md$|\.txt$|\.json$|\.csv$/i.test(file.name)) reader.readAsText(file);
    else reader.readAsText(file); // PDFs need server extraction; Open Notebook handles ingestion
  });
}
export function chunkText(text: string, size = 4000): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size));
  return chunks.filter(Boolean);
}
