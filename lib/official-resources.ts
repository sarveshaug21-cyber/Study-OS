// Verified official examination-board resource pages.
// Only URLs returning HTTP 200 on verification are marked "verified".
// Verification date: 2026-11-10. Re-verify periodically; board sites change.
export type OfficialResource = {
  board: string;
  resourceType: "past-papers" | "specifications" | "mark-schemes";
  url: string;
  verified: boolean;
  verifiedOn: string;
  note?: string;
};

export const OFFICIAL_RESOURCES: OfficialResource[] = [
  { board: "AQA", resourceType: "past-papers", url: "https://www.aqa.org.uk/find-past-papers-and-mark-schemes", verified: true, verifiedOn: "2026-11-10" },
  { board: "Pearson Edexcel", resourceType: "past-papers", url: "https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html", verified: true, verifiedOn: "2026-11-10" },
  { board: "OCR", resourceType: "past-papers", url: "https://www.ocr.org.uk/qualifications/past-papers/", verified: true, verifiedOn: "2026-11-10" },
  { board: "WJEC", resourceType: "past-papers", url: "https://www.wjec.co.uk/qualifications/", verified: false, verifiedOn: "2026-11-10", note: "Past-paper search is within the qualifications section; direct past-paper URL not verified." },
  { board: "Eduqas", resourceType: "past-papers", url: "https://www.eduqas.co.uk/qualifications/", verified: false, verifiedOn: "2026-11-10", note: "Past-paper search is within the qualifications section; direct past-paper URL not verified." },
  { board: "CCEA", resourceType: "past-papers", url: "https://www.ccea.org.uk/", verified: false, verifiedOn: "2026-11-10", note: "Board site returns 403 to automated requests; verify manually in a browser." },
];
