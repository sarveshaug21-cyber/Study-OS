// Source register types for the official exam-board content import pipeline.
export type Board = "AQA" | "Pearson Edexcel" | "OCR" | "WJEC" | "Eduqas" | "CCEA";
export type Qualification = "GCSE" | "International GCSE" | "A-level" | "International A-level";
export type ResourceType = "specification" | "question-paper" | "mark-scheme" | "examiner-report" | "sample-assessment" | "assessment-guide";

export type SourceStatus = "verified" | "unverified" | "unavailable" | "superseded" | "withdrawn";

export interface SourceRecord {
  id: string;            // stable composite key, e.g. "aqa-gcse-biology-7402-spec"
  board: Board;
  qualification: Qualification;
  subject: string;
  resourceType: ResourceType;
  title: string;
  code?: string;          // spec/paper code
  version?: string;
  url: string;
  directUrl?: string;
  verified: boolean;
  verifiedOn: string;     // ISO date
  status: SourceStatus;
  note?: string;
}

export interface CoverageEntry {
  board: Board;
  qualification: Qualification;
  subject: string;
  spec: SourceStatus;
  topics: SourceStatus;
  pastPapers: SourceStatus;
  markSchemes: SourceStatus;
  examinerReports: SourceStatus;
  lastChecked: string;
  note?: string;
}

export interface ValidationResult { ok: boolean; errors: string[]; warnings: string[]; }

export interface ImportPreview {
  newRecords: SourceRecord[];
  duplicates: SourceRecord[];
  invalid: { record: SourceRecord; errors: string[] }[];
  summary: { total: number; new: number; duplicates: number; invalid: number };
}
