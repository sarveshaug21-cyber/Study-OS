// Canonical qualification architecture for Study OS.
//
// This module is the single source of truth for:
//   • which exam boards award which qualifications,
//   • the structure of each qualification (stage, years, assessment model),
//   • the grading scale used to interpret marks.
//
// Everything else (catalogue, API validation, forms, AI prompts) derives from
// here so that board/qualification availability can never drift between the
// catalogue and the data the app will actually accept.

export const EXAM_BOARDS = [
  "AQA",
  "Pearson Edexcel",
  "OCR",
  "WJEC",
  "Eduqas",
  "CCEA",
] as const;

export type ExamBoard = (typeof EXAM_BOARDS)[number];

export const QUALIFICATION_LEVELS = [
  "GCSE",
  "International GCSE",
  "A-level",
  "International A-level",
] as const;

export type QualificationLevel = (typeof QUALIFICATION_LEVELS)[number];

/** School stage a qualification belongs to. */
export type QualificationStage = "Key Stage 4" | "Key Stage 5";

export function isExamBoard(value: unknown): value is ExamBoard {
  return (
    typeof value === "string" &&
    (EXAM_BOARDS as readonly string[]).includes(value)
  );
}

export function isQualificationLevel(value: unknown): value is QualificationLevel {
  return (
    typeof value === "string" &&
    (QUALIFICATION_LEVELS as readonly string[]).includes(value)
  );
}

/**
 * Which qualifications each board awards.
 *
 * Academic accuracy note: Pearson Edexcel awards the *International* GCSE and
 * *International* A-level. It does not award the English GCSE or A-level —
 * those are awarded by AQA, OCR, WJEC, Eduqas and CCEA.
 */
export const BOARD_QUALIFICATIONS: Record<
  ExamBoard,
  readonly QualificationLevel[]
> = {
  AQA: ["GCSE", "A-level"],
  "Pearson Edexcel": ["International GCSE", "International A-level"],
  OCR: ["GCSE", "A-level"],
  WJEC: ["GCSE", "A-level"],
  Eduqas: ["GCSE", "A-level"],
  CCEA: ["GCSE", "A-level"],
};

export function boardOffersQualification(
  board: ExamBoard,
  level: QualificationLevel,
): boolean {
  return BOARD_QUALIFICATIONS[board].includes(level);
}

export function availableQualificationsForBoard(
  board: ExamBoard,
): readonly QualificationLevel[] {
  return BOARD_QUALIFICATIONS[board];
}

export function boardsForQualification(
  level: QualificationLevel,
): readonly ExamBoard[] {
  return EXAM_BOARDS.filter((board) => boardOffersQualification(board, level));
}

export type GradeDescriptor = {
  grade: string;
  label: string;
  /** Higher rank = stronger grade. Used for sorting and comparisons. */
  rank: number;
  /** True when the grade counts as a pass at this level. */
  pass: boolean;
  /** Approximate equivalence on the pre-9–1 scale (GCSE only). */
  legacyEquivalent?: string;
};

export type GradingScale = {
  id: "nine-to-one" | "a-level";
  label: string;
  summary: string;
  grades: GradeDescriptor[];
};

const NINE_TO_ONE: GradingScale = {
  id: "nine-to-one",
  label: "9–1 grading scale",
  summary:
    "England's 9–1 scale for GCSE and International GCSE. Grade 4 is a standard pass; grade 3 is a lower pass; grades 2 and 1 are below a pass.",
  grades: [
    { grade: "9", label: "Exceptional", rank: 9, pass: false, legacyEquivalent: "A*" },
    { grade: "8", label: "Distinction (higher)", rank: 8, pass: false, legacyEquivalent: "A" },
    { grade: "7", label: "Distinction (higher)", rank: 7, pass: false, legacyEquivalent: "B" },
    { grade: "6", label: "Merit (standard)", rank: 6, pass: false, legacyEquivalent: "C" },
    { grade: "5", label: "Merit (standard)", rank: 5, pass: false, legacyEquivalent: "C" },
    { grade: "4", label: "Pass (standard)", rank: 4, pass: true, legacyEquivalent: "C" },
    { grade: "3", label: "Pass (lower)", rank: 3, pass: true, legacyEquivalent: "D" },
    { grade: "2", label: "Below pass", rank: 2, pass: false, legacyEquivalent: "E" },
    { grade: "1", label: "Below pass", rank: 1, pass: false, legacyEquivalent: "F" },
  ],
};

const A_LEVEL_SCALE: GradingScale = {
  id: "a-level",
  label: "A*–E grading scale",
  summary:
    "A-level and International A-level are graded A*, A, B, C, D, E. Grade E is a pass; A* is the highest grade.",
  grades: [
    { grade: "A*", label: "Exceptional", rank: 7, pass: true },
    { grade: "A", label: "Excellent", rank: 6, pass: true },
    { grade: "B", label: "Good", rank: 5, pass: true },
    { grade: "C", label: "Pass", rank: 4, pass: true },
    { grade: "D", label: "Pass", rank: 3, pass: true },
    { grade: "E", label: "Pass", rank: 2, pass: true },
  ],
};

export type QualificationMeta = {
  key: QualificationLevel;
  name: string;
  shortName: string;
  /** School stage the qualification belongs to. */
  stage: "Key Stage 4" | "Key Stage 5";
  /** Year groups a student is normally studying this qualification in. */
  typicalYearGroups: readonly string[];
  /** Year group a student is normally in when taking the final assessment. */
  finalYearGroup: string;
  gradingScale: GradingScale;
  /** How the qualification is normally structured. */
  assessmentModel: string;
  /** Named parts of the qualification, e.g. AS / A2 or Paper 1 / Paper 2. */
  components: readonly string[];
  /** Next step for a student who completes this qualification. */
  progression: string;
  /** Whether the qualification is an international (non-England) award. */
  international: boolean;
};

export const QUALIFICATION_ARCHITECTURE: Record<
  QualificationLevel,
  QualificationMeta
> = {
  GCSE: {
    key: "GCSE",
    name: "GCSE",
    shortName: "GCSE",
    stage: "Key Stage 4",
    typicalYearGroups: ["Year 10", "Year 11"],
    finalYearGroup: "Year 11",
    gradingScale: NINE_TO_ONE,
    assessmentModel:
      "A single qualification taken across two years, usually ending with a written summer series. Assessed by examination, coursework or controlled assessment depending on the subject.",
    components: ["Coursework / controlled assessment", "Final written examination"],
    progression: "A-level, T-level or an apprenticeship.",
    international: false,
  },
  "International GCSE": {
    key: "International GCSE",
    name: "International GCSE",
    shortName: "IGCSE",
    stage: "Key Stage 4",
    typicalYearGroups: ["Year 10", "Year 11"],
    finalYearGroup: "Year 11",
    gradingScale: NINE_TO_ONE,
    assessmentModel:
      "A single qualification taken across two years. Designed for international students and for English-speaking schools abroad; assessed by examination and/or coursework.",
    components: ["Coursework (where offered)", "Final written examination"],
    progression: "International A-level, A-level or an apprenticeship.",
    international: true,
  },
  "A-level": {
    key: "A-level",
    name: "A level",
    shortName: "A level",
    stage: "Key Stage 5",
    typicalYearGroups: ["Year 12", "Year 13"],
    finalYearGroup: "Year 13",
    gradingScale: A_LEVEL_SCALE,
    assessmentModel:
      "A two-year linear qualification: Year 12 content is usually assessed at the end of Year 13 together with Year 13 content. Some subjects include non-examined assessment.",
    components: ["Year 12 (AS-level) content", "Year 13 (A2-level) content"],
    progression: "University, a degree apprenticeship or an HNC/HND.",
    international: false,
  },
  "International A-level": {
    key: "International A-level",
    name: "International A level",
    shortName: "IA Level",
    stage: "Key Stage 5",
    typicalYearGroups: ["Year 12", "Year 13"],
    finalYearGroup: "Year 13",
    gradingScale: A_LEVEL_SCALE,
    assessmentModel:
      "A two-year linear qualification structured as AS Level followed by A Level, assessed by examination and/or coursework.",
    components: ["AS Level", "A Level"],
    progression: "University (including international universities) or an apprenticeship.",
    international: true,
  },
};

export function getQualification(
  level: QualificationLevel,
): QualificationMeta {
  return QUALIFICATION_ARCHITECTURE[level];
}

export function getGradingScale(level: QualificationLevel): GradingScale {
  return QUALIFICATION_ARCHITECTURE[level].gradingScale;
}

/** Year groups a student taking `level` is normally studying in. */
export function yearGroupsForQualification(
  level: QualificationLevel,
): readonly string[] {
  return QUALIFICATION_ARCHITECTURE[level].typicalYearGroups;
}

/**
 * The year group a student is normally in when sitting the final assessment
 * for a qualification. Used to default AI tutor behaviour.
 */
export function defaultYearGroupForQualification(
  level: string | null | undefined,
): string | null {
  if (!level || !isQualificationLevel(level)) return null;
  return QUALIFICATION_ARCHITECTURE[level].finalYearGroup;
}

/** Examination stage for a qualification (used for labelling and routing). */
export function stageFor(level: QualificationLevel): QualificationStage {
  return QUALIFICATION_ARCHITECTURE[level].stage;
}

/** Human-readable label for the examination stage. */
export function stageLabel(level: QualificationLevel): string {
  const stage = stageFor(level);
  return stage === "Key Stage 4" ? "Secondary (ages 14–16)" : "Further (ages 16–18)";
}

/** Structured overview of a qualification for display in lists and dashboards. */
export function getQualificationOverview(
  level: QualificationLevel,
): { level: QualificationLevel; stage: QualificationStage; years: string[]; finalYear: string; international: boolean } {
  const meta = QUALIFICATION_ARCHITECTURE[level];
  return {
    level,
    stage: meta.stage,
    years: [...meta.typicalYearGroups],
    finalYear: meta.finalYearGroup,
    international: meta.international,
  };
}

/** Grades that count as a pass at the given level, strongest first. */
export function passingGrades(level: QualificationLevel): GradeDescriptor[] {
  return getGradingScale(level)
    .grades.filter((grade) => grade.pass)
    .sort((a, b) => b.rank - a.rank);
}

/**
 * Translate a percentage into a predicted grade using the published grade
 * boundaries for the level. Boundaries are the commonly published guidance
 * used by schools for target-setting, not an official awarding decision.
 */
const PERCENTAGE_BOUNDARIES: Record<QualificationLevel, { grade: string; min: number }[]> = {
  GCSE: [
    { grade: "9", min: 80 },
    { grade: "8", min: 70 },
    { grade: "7", min: 60 },
    { grade: "6", min: 55 },
    { grade: "5", min: 50 },
    { grade: "4", min: 40 },
    { grade: "3", min: 30 },
    { grade: "2", min: 20 },
    { grade: "1", min: 0 },
  ],
  "International GCSE": [
    { grade: "9", min: 80 },
    { grade: "8", min: 70 },
    { grade: "7", min: 60 },
    { grade: "6", min: 55 },
    { grade: "5", min: 50 },
    { grade: "4", min: 40 },
    { grade: "3", min: 30 },
    { grade: "2", min: 20 },
    { grade: "1", min: 0 },
  ],
  "A-level": [
    { grade: "A*", min: 80 },
    { grade: "A", min: 70 },
    { grade: "B", min: 60 },
    { grade: "C", min: 50 },
    { grade: "D", min: 40 },
    { grade: "E", min: 30 },
  ],
  "International A-level": [
    { grade: "A*", min: 80 },
    { grade: "A", min: 70 },
    { grade: "B", min: 60 },
    { grade: "C", min: 50 },
    { grade: "D", min: 40 },
    { grade: "E", min: 30 },
  ],
};

export function gradeFromPercentage(
  level: QualificationLevel,
  percentage: number,
): string | null {
  if (!Number.isFinite(percentage)) return null;
  const clamped = Math.max(0, Math.min(100, percentage));
  const boundary = PERCENTAGE_BOUNDARIES[level].find(
    (entry) => clamped >= entry.min,
  );
  return boundary ? boundary.grade : null;
}

/**
 * Validate a board + qualification pairing.
 * Returns `null` when the pairing is valid, otherwise a human-readable reason.
 */
export function validateBoardQualification(
  board: unknown,
  level: unknown,
): string | null {
  if (!isExamBoard(board)) return "Invalid exam board";
  if (!isQualificationLevel(level)) return "Invalid qualification";
  if (!boardOffersQualification(board, level)) {
    return `${board} does not award ${level}. ${board} awards: ${BOARD_QUALIFICATIONS[board].join(
      ", ",
    )}.`;
  }
  return null;
}
