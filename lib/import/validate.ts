import type { SourceRecord, ValidationResult } from "./types";
const BOARDS = ["AQA","Pearson Edexcel","OCR","WJEC","Eduqas","CCEA"];
const QUALS = ["GCSE","International GCSE","A-level","International A-level"];
const TYPES = ["specification","question-paper","mark-scheme","examiner-report","sample-assessment","assessment-guide"];
export function validateSource(r: SourceRecord | any): ValidationResult {
  const errors: string[] = []; const warnings: string[] = [];
  if (!r.id || !/^[a-z0-9-]+$/.test(r.id)) errors.push("id must be lowercase slug");
  if (!BOARDS.includes(r.board)) errors.push("unknown board");
  if (!QUALS.includes(r.qualification)) errors.push("unknown qualification");
  if (!r.subject?.trim()) errors.push("subject required");
  if (!TYPES.includes(r.resourceType)) errors.push("unknown resourceType");
  if (!r.title?.trim()) errors.push("title required");
  if (!/^https?:\/\//.test(r.url)) errors.push("url must be http(s)");
  if (r.verified && !r.verifiedOn) errors.push("verified records need verifiedOn");
  if (r.verified && !/^https?:\/\/(www\.)?(aqa|qualifications\.pearson|ocr|wjec|eduqas|rewardinglearning)\./.test(r.url)) warnings.push("verified URL is not on a known official domain");
  if (!r.code) warnings.push("no code/spec code recorded");
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
