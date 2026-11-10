import type { SourceRecord, ValidationResult } from "./types";
const BOARDS = ["AQA","Pearson Edexcel","OCR","WJEC","Eduqas","CCEA"];
const QUALS = ["GCSE","International GCSE","A-level","International A-level"];
const TYPES = ["specification","question-paper","mark-scheme","examiner-report","sample-assessment","assessment-guide"];
export function validateSource(r: unknown): ValidationResult {
  const rec = r as SourceRecord;
  const errors: string[] = []; const warnings: string[] = [];
  if (!rec.id || !/^[a-z0-9-]+$/.test(rec.id)) errors.push("id must be lowercase slug");
  if (!BOARDS.includes(rec.board)) errors.push("unknown board");
  if (!QUALS.includes(rec.qualification)) errors.push("unknown qualification");
  if (!rec.subject?.trim()) errors.push("subject required");
  if (!TYPES.includes(rec.resourceType)) errors.push("unknown resourceType");
  if (!rec.title?.trim()) errors.push("title required");
  if (!/^https?:\/\//.test(rec.url)) errors.push("url must be http(s)");
  if (rec.verified && !rec.verifiedOn) errors.push("verified records need verifiedOn");
  if (rec.verified && !/^https?:\/\/(www\.)?(aqa|qualifications\.pearson|ocr|wjec|eduqas|rewardinglearning)\./.test(rec.url)) warnings.push("verified URL is not on a known official domain");
  if (!rec.code) warnings.push("no code/spec code recorded");
  return { ok: errors.length === 0, errors, warnings };
}
export function dedupe(existing: SourceRecord[], incoming: SourceRecord[]): { newRecords: SourceRecord[]; duplicates: SourceRecord[] } {
  const seen = new Set(existing.map((r) => r.id));
  const newRecords: SourceRecord[] = []; const duplicates: SourceRecord[] = [];
  for (const r of incoming) { if (seen.has(r.id)) duplicates.push(r); else { newRecords.push(r); seen.add(r.id); } }
  return { newRecords, duplicates };
}
export function dryRun(existing: SourceRecord[], incoming: SourceRecord[]) {
  const { newRecords, duplicates } = dedupe(existing, incoming);
  const invalid: { record: SourceRecord; errors: string[] }[] = [];
  const validNew: SourceRecord[] = [];
  for (const r of newRecords) { const v = validateSource(r); if (v.ok) validNew.push(r); else invalid.push({ record: r, errors: v.errors }); }
  return { newRecords: validNew, duplicates, invalid, summary: { total: incoming.length, new: validNew.length, duplicates: duplicates.length, invalid: invalid.length } };
}
