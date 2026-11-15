import {
  BOARD_QUALIFICATIONS,
  EXAM_BOARDS,
  QUALIFICATION_LEVELS,
  type ExamBoard,
  type QualificationLevel,
} from "@/lib/qualifications";

export {
  EXAM_BOARDS,
  QUALIFICATION_LEVELS,
  BOARD_QUALIFICATIONS,
  type ExamBoard,
  type QualificationLevel,
} from "@/lib/qualifications";

/** Alias kept for existing consumers of the catalogue. */
export const QUALIFICATIONS = QUALIFICATION_LEVELS;

export const BOARD_OFFICIAL_URLS: Record<ExamBoard, string> = {
  AQA: "https://www.aqa.org.uk",
  "Pearson Edexcel": "https://qualifications.pearson.com",
  OCR: "https://www.ocr.org.uk",
  WJEC: "https://www.wjec.co.uk",
  Eduqas: "https://www.eduqas.co.uk",
  CCEA: "https://www.rewardinglearning.org.uk",
};

/**
 * Board registry. `qualifications` is derived from the canonical qualification
 * architecture so the catalogue can never advertise a qualification a board
 * does not actually award.
 */
export const EXAM_BOARD_CATALOG: ReadonlyArray<{
  board: ExamBoard;
  officialUrl: string;
  qualifications: readonly QualificationLevel[];
}> = EXAM_BOARDS.map((board) => ({
  board,
  officialUrl: BOARD_OFFICIAL_URLS[board],
  qualifications: BOARD_QUALIFICATIONS[board],
}));

export const OFFICIAL_UPDATES_URLS = [
  { board: "AQA", label: "AQA subject updates", url: "https://www.aqa.org.uk/about-aqa/regulation" },
  { board: "Pearson Edexcel", label: "Pearson updates", url: "https://qualifications.pearson.com/news.html" },
  { board: "OCR", label: "OCR news", url: "https://www.ocr.org.uk/news/" },
  { board: "WJEC", label: "WJEC news", url: "https://www.wjec.co.uk/news.html" },
  { board: "Eduqas", label: "Eduqas news", url: "https://www.eduqas.co.uk/news.html" },
  { board: "CCEA", label: "CCEA news", url: "https://www.rewardinglearning.org.uk/news" },
] as const;
