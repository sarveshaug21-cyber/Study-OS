// Examination board intelligence.
//
// For each awarding body Study OS supports, this module records the facts a
// student actually needs when planning revision: which qualifications and
// tiers exist, how assessment is structured, when the exam windows fall, and
// how the board names its specification codes.
//
// Everything here is descriptive metadata about *how the boards work*. It does
// not invent syllabus content — topic-level detail belongs to the
// specification catalogue (see lib/specifications.ts).

import {
  BOARD_QUALIFICATIONS,
  getQualificationOverview,
  type ExamBoard,
  type QualificationLevel,
} from "@/lib/qualifications";

export type ExamSession = {
  /** Stable identifier used for grouping papers, e.g. "may-june". */
  id: string;
  /** Human label shown to students. */
  label: string;
  /** Typical month of the exam window. */
  month: string;
  /** Relative order within the academic year (1 = earliest). */
  order: number;
};

export type AssessmentStructure = {
  /** How the qualification is split into components. */
  components: string;
  /** Where the marks mostly come from. */
  assessedBy: string;
  /** How much non-examined assessment there is, if any. */
  coursework: string;
  /** How resits are handled. */
  resits: string;
};

export type Tiering = {
  /** Whether the board splits this qualification into tiers. */
  supported: boolean;
  /** Tier names in ascending order. */
  tiers: readonly string[];
  /** Subjects where tiering applies. */
  subjects: readonly string[];
  note: string;
};

export type BoardIntelligence = {
  board: ExamBoard;
  /** Full legal/brand name of the awarding body. */
  organisation: string;
  /** Short description of the board's identity. */
  summary: string;
  officialUrl: string;
  /** Qualifications this board awards. */
  qualifications: readonly QualificationLevel[];
  /** Where students should look for past papers. */
  pastPapersUrl: string;
  /** Where specification documents are published. */
  specificationUrl: string;
  /** Typical exam sessions for this board. */
  sessions: readonly ExamSession[];
  /** Assessment model per qualification level. */
  assessment: Record<QualificationLevel, AssessmentStructure>;
  /** Tiering rules per qualification level. */
  tiering: Record<QualificationLevel, Tiering>;
  /** How the board structures a specification code. */
  codeFormat: string;
  /** Note about the board's command-word / assessment-objective style. */
  assessmentStyle: string;
};

const ENGLISH_SESSIONS: readonly ExamSession[] = [
  { id: "january", label: "January", month: "January", order: 1 },
  { id: "may-june", label: "May / June", month: "May–June", order: 2 },
  { id: "october", label: "October", month: "October", order: 3 },
];

const NO_TIERING: Tiering = {
  supported: false,
  tiers: [],
  subjects: [],
  note: "No tiered entry for this qualification.",
};

const EDEXCEL_TIERING: Tiering = {
  supported: true,
  tiers: ["Foundation", "Intermediate", "Higher"],
  subjects: ["Mathematics"],
  note: "Foundation and Intermediate are entry-level tiers; Higher carries the full GCSE content.",
};

const STANDARD_ASSESSMENT = (
  components: string,
  assessedBy: string,
  coursework: string,
  resits: string,
): AssessmentStructure => ({ components, assessedBy, coursework, resits });

const ENGLISH_GCSE_ASSESSMENT = STANDARD_ASSESSMENT(
  "Two written papers (plus a separate practical or coursework component where the subject requires one)",
  "Written examination",
  "Varies by subject: coursework, practical assessment or a controlled assessment (for example NEA in Computer Science)",
  "A full resit is allowed in a later series; the best grade is carried forward",
);

const ENGLISH_A_LEVEL_ASSESSMENT = STANDARD_ASSESSMENT(
  "Year 12 (AS) and Year 13 (A2) content, normally assessed together in the final series",
  "Written examination",
  "Some subjects include a non-examined assessment (NEA) or internally assessed practical work",
  "A full resit is allowed in a later series; the best grade is carried forward",
);

const INTERNATIONAL_GCSE_ASSESSMENT = STANDARD_ASSESSMENT(
  "Two written papers per subject, plus coursework where the subject offers it",
  "Written examination and/or coursework",
  "Optional for most subjects; available in Mathematics, English, Economics, Business, Geography, History and others",
  "A full resit is allowed in a later series; the best grade is carried forward",
);

const INTERNATIONAL_A_LEVEL_ASSESSMENT = STANDARD_ASSESSMENT(
  "AS Level (Year 12) and A Level (Year 13), each with its own examination series",
  "Written examination and/or coursework",
  "Optional in most subjects; compulsory in some (for example Art, Business and some Social Sciences papers)",
  "A full resit of an individual AS or A Level component is allowed; the best grade is carried forward",
);

export const BOARD_INTELLIGENCE: Record<ExamBoard, BoardIntelligence> = {
  AQA: {
    board: "AQA",
    qualifications: BOARD_QUALIFICATIONS["AQA"],
    organisation: "AQA (AQA Awards)",
    summary:
      "England's largest awarding body for GCSE and A-level. Specification codes begin with the subject number (for example 7402 for A-level Biology).",
    officialUrl: "https://www.aqa.org.uk",
    pastPapersUrl: "https://www.aqa.org.uk/exams-and-test-marks/past-papers",
    specificationUrl: "https://www.aqa.org.uk/subjects",
    sessions: ENGLISH_SESSIONS,
    codeFormat: "Four-digit subject code (for example 7402), then paper numbers such as 7402/1",
    assessmentStyle:
      "Command words are matched to assessment objectives; many papers split into Section A and Section B, with Section A often containing shorter structured questions.",
    assessment: {
      GCSE: ENGLISH_GCSE_ASSESSMENT,
      "International GCSE": INTERNATIONAL_GCSE_ASSESSMENT,
      "A-level": ENGLISH_A_LEVEL_ASSESSMENT,
      "International A-level": INTERNATIONAL_A_LEVEL_ASSESSMENT,
    },
    tiering: {
      GCSE: NO_TIERING,
      "International GCSE": NO_TIERING,
      "A-level": NO_TIERING,
      "International A-level": NO_TIERING,
    },
  },
  "Pearson Edexcel": {
    board: "Pearson Edexcel",
    qualifications: BOARD_QUALIFICATIONS["Pearson Edexcel"],
    organisation: "Pearson Education Limited (Pearson Edexcel)",
    summary:
      "Awarding body for the International GCSE and International A-level, examined internationally. Specification codes follow the 4-unit scheme (for example 4PH1, 9MA0).",
    officialUrl: "https://qualifications.pearson.com",
    pastPapersUrl:
      "https://qualifications.pearson.com/international-qualifications/past-papers.html",
    specificationUrl:
      "https://qualifications.pearson.com/international-qualifications/qualification-resources.html",
    sessions: [
      { id: "january", label: "January", month: "January", order: 1 },
      { id: "may-june", label: "May / June", month: "May–June", order: 2 },
      { id: "october", label: "October", month: "October", order: 3 },
    ],
    codeFormat:
      "Letter-number subject code with unit number (for example 4PH1, 9MA0), then paper codes such as 4PH1/1P",
    assessmentStyle:
      "Structured, applied questions with a strong 'explain why' focus; Edexcel publishes a question-level guidance document for each paper.",
    assessment: {
      GCSE: ENGLISH_GCSE_ASSESSMENT,
      "International GCSE": INTERNATIONAL_GCSE_ASSESSMENT,
      "A-level": ENGLISH_A_LEVEL_ASSESSMENT,
      "International A-level": INTERNATIONAL_A_LEVEL_ASSESSMENT,
    },
    tiering: {
      GCSE: NO_TIERING,
      "International GCSE": EDEXCEL_TIERING,
      "A-level": NO_TIERING,
      "International A-level": NO_TIERING,
    },
  },
  OCR: {
    board: "OCR",
    qualifications: BOARD_QUALIFICATIONS["OCR"],
    organisation: "OCR (Oxford Cambridge and RSA Examinations)",
    summary:
      "Awarding body for GCSE, A-level and vocational qualifications. Specification codes use letter-number pairs such as H432 or J277.",
    officialUrl: "https://www.ocr.org.uk",
    pastPapersUrl: "https://www.ocr.org.uk/qualifications/past-papers/",
    specificationUrl: "https://www.ocr.org.uk/qualifications/",
    sessions: ENGLISH_SESSIONS,
    codeFormat:
      "Letter-number subject code (for example H432, J277), then paper codes such as H432/01",
    assessmentStyle:
      "Command words align to OCR assessment objectives; many papers include a structured multiple-choice or short-answer Section A.",
    assessment: {
      GCSE: ENGLISH_GCSE_ASSESSMENT,
      "International GCSE": INTERNATIONAL_GCSE_ASSESSMENT,
      "A-level": ENGLISH_A_LEVEL_ASSESSMENT,
      "International A-level": INTERNATIONAL_A_LEVEL_ASSESSMENT,
    },
    tiering: {
      GCSE: NO_TIERING,
      "International GCSE": NO_TIERING,
      "A-level": NO_TIERING,
      "International A-level": NO_TIERING,
    },
  },
  WJEC: {
    board: "WJEC",
    qualifications: BOARD_QUALIFICATIONS["WJEC"],
    organisation: "WJEC (WJEC/Eduqas)",
    summary:
      "Awarding body operating in Wales and across the UK, delivering GCSE and A-level through the Eduqas brand for England and the WJEC brand for Wales.",
    officialUrl: "https://www.wjec.co.uk",
    pastPapersUrl: "https://www.wjec.co.uk/Qualifications/Examinations/Past-Papers/",
    specificationUrl: "https://www.wjec.co.uk/Qualifications/",
    sessions: ENGLISH_SESSIONS,
    codeFormat:
      "Subject codes commonly carry a unit suffix (for example C720U10-1 for a GCSE unit paper)",
    assessmentStyle:
      "Assessment objectives are named explicitly (for example AO1, AO2, AO3) and mark schemes refer back to them.",
    assessment: {
      GCSE: ENGLISH_GCSE_ASSESSMENT,
      "International GCSE": INTERNATIONAL_GCSE_ASSESSMENT,
      "A-level": ENGLISH_A_LEVEL_ASSESSMENT,
      "International A-level": INTERNATIONAL_A_LEVEL_ASSESSMENT,
    },
    tiering: {
      GCSE: NO_TIERING,
      "International GCSE": NO_TIERING,
      "A-level": NO_TIERING,
      "International A-level": NO_TIERING,
    },
  },
  Eduqas: {
    board: "Eduqas",
    qualifications: BOARD_QUALIFICATIONS["Eduqas"],
    organisation: "WJEC/Eduqas",
    summary:
      "The England-facing brand of WJEC. Offers GCSE and A-level with the same qualification families as WJEC but with Eduqas-specific codes and assessment windows.",
    officialUrl: "https://www.eduqas.co.uk",
    pastPapersUrl: "https://www.eduqas.co.uk/Qualifications/Examinations/Past-Papers/",
    specificationUrl: "https://www.eduqas.co.uk/Qualifications/",
    sessions: ENGLISH_SESSIONS,
    codeFormat:
      "Subject codes commonly carry a unit suffix (for example C111U10-1 for a GCSE unit paper)",
    assessmentStyle:
      "Assessment objectives are named explicitly and mark schemes refer back to them; linear A-level structure.",
    assessment: {
      GCSE: ENGLISH_GCSE_ASSESSMENT,
      "International GCSE": INTERNATIONAL_GCSE_ASSESSMENT,
      "A-level": ENGLISH_A_LEVEL_ASSESSMENT,
      "International A-level": INTERNATIONAL_A_LEVEL_ASSESSMENT,
    },
    tiering: {
      GCSE: NO_TIERING,
      "International GCSE": NO_TIERING,
      "A-level": NO_TIERING,
      "International A-level": NO_TIERING,
    },
  },
  CCEA: {
    board: "CCEA",
    qualifications: BOARD_QUALIFICATIONS["CCEA"],
    organisation: "CCEA (Council for the Curriculum, Examinations and Assessment)",
    summary:
      "Northern Ireland's awarding body for GCSE, A-level and vocational qualifications, using the CCEA brand across both levels.",
    officialUrl: "https://www.rewardinglearning.org.uk",
    pastPapersUrl: "https://www.rewardinglearning.org.uk/examinations/past-papers/",
    specificationUrl: "https://www.rewardinglearning.org.uk/qualifications/",
    sessions: ENGLISH_SESSIONS,
    codeFormat:
      "Letter-number subject code (for example H201), then paper codes such as H201/1",
    assessmentStyle:
      "Assessment objectives are named explicitly and applied through the mark schemes; curriculum content is organised into units.",
    assessment: {
      GCSE: ENGLISH_GCSE_ASSESSMENT,
      "International GCSE": INTERNATIONAL_GCSE_ASSESSMENT,
      "A-level": ENGLISH_A_LEVEL_ASSESSMENT,
      "International A-level": INTERNATIONAL_A_LEVEL_ASSESSMENT,
    },
    tiering: {
      GCSE: NO_TIERING,
      "International GCSE": NO_TIERING,
      "A-level": NO_TIERING,
      "International A-level": NO_TIERING,
    },
  },
};

export function getBoardIntelligence(board: ExamBoard): BoardIntelligence {
  return BOARD_INTELLIGENCE[board];
}

export function boardAssessment(
  board: ExamBoard,
  level: QualificationLevel,
): AssessmentStructure {
  return BOARD_INTELLIGENCE[board].assessment[level];
}

export function boardTiering(
  board: ExamBoard,
  level: QualificationLevel,
): Tiering {
  return BOARD_INTELLIGENCE[board].tiering[level];
}

export function boardSessions(board: ExamBoard): readonly ExamSession[] {
  return BOARD_INTELLIGENCE[board].sessions;
}

/**
 * All board/qualification combinations Study OS supports, expanded from the
 * qualification architecture. Useful for catalogue screens and for validating
 * that a subject's board and level agree.
 */
export function supportedBoardQualifications(): {
  board: ExamBoard;
  level: QualificationLevel;
}[] {
  const pairs: { board: ExamBoard; level: QualificationLevel }[] = [];
  for (const board of Object.keys(BOARD_INTELLIGENCE) as ExamBoard[]) {
    for (const level of BOARD_QUALIFICATIONS[board]) {
      pairs.push({ board, level });
    }
  }
  return pairs;
}

/** A board's qualifications with their stage and typical year groups. */
export type BoardQualificationEntry = {
  level: QualificationLevel;
  stage: "Key Stage 4" | "Key Stage 5";
  years: string[];
  finalYear: string;
  international: boolean;
};

export type BoardOverview = {
  board: ExamBoard;
  organisation: string;
  officialUrl: string;
  summary: string;
  sessions: readonly ExamSession[];
  qualifications: BoardQualificationEntry[];
};

/**
 * Structured board summary used by catalogue and workspace screens. It combines
 * the canonical qualification list with the board intelligence so the UI never
 * has to reconstruct which qualifications a board actually awards.
 */
export function getBoardOverview(board: ExamBoard): BoardOverview {
  const intelligence = BOARD_INTELLIGENCE[board];
  return {
    board,
    organisation: intelligence.organisation,
    officialUrl: intelligence.officialUrl,
    summary: intelligence.summary,
    sessions: intelligence.sessions,
    qualifications: BOARD_QUALIFICATIONS[board].map((level) =>
      getQualificationOverview(level),
    ),
  };
}

/** Overviews for all six awarding bodies, ordered canonically. */
export function boardOverviews(): BoardOverview[] {
  return (Object.keys(BOARD_INTELLIGENCE) as ExamBoard[]).map(getBoardOverview);
}
