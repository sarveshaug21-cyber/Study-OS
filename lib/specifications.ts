// Specification mapping.
//
// Study OS keeps three separate things apart, and this module owns that
// separation:
//
//   1. The *structure* of a specification — which assessment objectives a
//      board uses, which command words it issues and what they demand.
//      These are published by every UK awarding body and are stable.
//   2. The *version* of a specification in force for a given exam year.
//      Specifications are revised, and a student sitting exams in 2027 must
//      be revising the version that applies to 2027.
//   3. The *coverage* of a specification — which topics are addressed by the
//      student and which are not.
//
// Deliberately absent: invented syllabus content. Topic lists belong to the
// board's own specification document and are only ever stored with an
// explicit `verified` flag.

import type { ExamBoard, QualificationLevel } from "@/lib/qualifications";

/** A published command word and what an answer must contain to earn marks. */
export type CommandWord = {
  word: string;
  /** What the question is asking the student to do. */
  intent: string;
  /** What a full-mark answer must demonstrate. */
  looksLike: string;
  /** Typical depth: 1 mark = factual recall, 3 = a developed explanation. */
  depth: 1 | 2 | 3;
};

export const COMMAND_WORDS: readonly CommandWord[] = [
  {
    word: "State / Give / Name / Identify",
    intent: "Recall a fact, name or label.",
    looksLike: "A short, accurate statement. No explanation is required or rewarded.",
    depth: 1,
  },
  {
    word: "Complete",
    intent: "Fill a gap in a given structure, graph, table or equation.",
    looksLike: "The missing value or label, written in the space provided.",
    depth: 1,
  },
  {
    word: "Describe",
    intent: "Give a clear account of features, steps or a process.",
    looksLike: "A sequence of linked statements; mark the points the scheme awards.",
    depth: 2,
  },
  {
    word: "Explain",
    intent: "Give reasons for a result, process or observation.",
    looksLike: "Cause and effect explicitly linked — every point needs a 'because'.",
    depth: 3,
  },
  {
    word: "Justify",
    intent: "Give reasons for a choice, method or conclusion.",
    looksLike: "A decision plus the evidence that supports it.",
    depth: 3,
  },
  {
    word: "Calculate",
    intent: "Apply a mathematical or scientific routine.",
    looksLike: "Correct method, correct substitution, correct units and a sensible rounding.",
    depth: 2,
  },
  {
    word: "Compare",
    intent: "Identify similarities and/or differences.",
    looksLike: "Explicit paired points, not two separate descriptions.",
    depth: 2,
  },
  {
    word: "Analyse / Analyze",
    intent: "Break a topic down and examine how its parts relate.",
    looksLike: "Structured examination of parts, patterns and relationships.",
    depth: 3,
  },
  {
    word: "Examine / Investigate",
    intent: "Consider a question or issue in detail.",
    looksLike: "A range of relevant points developed with subject terminology.",
    depth: 3,
  },
  {
    word: "Assess",
    intent: "Consider a range of factors and their relative importance.",
    looksLike: "Factors in both directions, then a reasoned judgement about significance.",
    depth: 3,
  },
  {
    word: "Evaluate",
    intent: "Judge against criteria and reach a supported conclusion.",
    looksLike: "Weighing of evidence, a conclusion, and a statement of what it depends on.",
    depth: 3,
  },
  {
    word: "Discuss",
    intent: "Consider different aspects or viewpoints of an issue.",
    looksLike: "Multiple developed points, each with its own evidence and reasoning.",
    depth: 3,
  },
  {
    word: "To what extent",
    intent: "Judge how far a claim is true.",
    looksLike: "A judgement of degree supported by evidence, not a yes/no answer.",
    depth: 3,
  },
];

export function findCommandWord(text: string): CommandWord | null {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return null;
  return (
    COMMAND_WORDS.find((command) => command.word.toLowerCase() === normalized) ??
    COMMAND_WORDS.find((command) =>
      command.word.toLowerCase().split(" / ")[0] === normalized,
    ) ??
    null
  );
}

/** How a board names and explains its assessment objectives. */
export type AssessmentObjective = {
  code: string;
  name: string;
  description: string;
};

const AQA_AOS: readonly AssessmentObjective[] = [
  { code: "AO1", name: "Knowledge and understanding", description: "Demonstrate knowledge and understanding of the subject content." },
  { code: "AO2", name: "Apply", description: "Apply knowledge and understanding of the subject content to real-life contexts." },
  { code: "AO3", name: "Analyse", description: "Analyse and evaluate information, including qualitative and quantitative data." },
  { code: "AO4", name: "Evaluate", description: "Evaluate arguments, concepts and issues, and use evidence to make reasoned judgements." },
];

const OCR_AOS: readonly AssessmentObjective[] = [
  { code: "AO1", name: "Demonstrate knowledge and understanding", description: "Demonstrate knowledge and understanding of the subject content." },
  { code: "AO2", name: "Apply knowledge and understanding", description: "Apply knowledge and understanding in different contexts to solve problems and make judgements about applications." },
  { code: "AO3", name: "Analyse, interpret and evaluate", description: "Analyse, interpret and evaluate information, including qualitative and quantitative data." },
  { code: "AO4", name: "Evaluate", description: "Evaluate arguments, concepts, issues and information to make reasoned, reasoned and substantiated judgements." },
];

const WJEC_AOS: readonly AssessmentObjective[] = [
  { code: "AO1", name: "Knowledge, understanding and skills", description: "Recall, select, organise and communicate knowledge and understanding of the subject content." },
  { code: "AO2", name: "Application of knowledge and understanding", description: "Apply knowledge and understanding of the subject content to make judgements, arguments and recommendations." },
  { code: "AO3", name: "Analysis and evaluation", description: "Analyse and evaluate information and evidence to make reasoned judgements and draw conclusions." },
];

const EDEXCEL_AOS: readonly AssessmentObjective[] = [
  { code: "AO1", name: "Demonstrate knowledge and understanding", description: "Demonstrate knowledge and understanding of the subject content." },
  { code: "AO2", name: "Apply knowledge and understanding", description: "Apply knowledge and understanding of the subject content to real-life contexts." },
  { code: "AO3", name: "Analyse", description: "Analyse and evaluate information, including qualitative and quantitative data." },
  { code: "AO4", name: "Evaluate", description: "Evaluate arguments, concepts and issues in order to make reasoned judgements." },
];

export const BOARD_ASSESSMENT_OBJECTIVES: Record<
  ExamBoard,
  readonly AssessmentObjective[]
> = {
  AQA: AQA_AOS,
  "Pearson Edexcel": EDEXCEL_AOS,
  OCR: OCR_AOS,
  WJEC: WJEC_AOS,
  Eduqas: WJEC_AOS,
  CCEA: WJEC_AOS,
};

export function assessmentObjectivesFor(
  board: ExamBoard,
): readonly AssessmentObjective[] {
  return BOARD_ASSESSMENT_OBJECTIVES[board];
}

export type SpecificationVersionStatus = "current" | "superseded" | "draft";

/** A published revision of a specification. */
export type SpecificationVersion = {
  /** e.g. "2024.1" */
  version: string;
  title: string;
  officialUrl?: string | null;
  /** Date the version first became teachable. */
  firstTeaching?: Date | string | null;
  /** Date of the first assessment the version applies to. */
  firstAssessment?: Date | string | null;
  changeSummary?: string | null;
  publishedAt?: Date | string | null;
};

function toTimestamp(value: Date | string | null | undefined): number | null {
  if (!value) return null;
  const parsed = value instanceof Date ? value.getTime() : Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Pick the specification version that applies to a given exam year.
 *
 * The rule used by awarding bodies is "the version whose first assessment
 * falls on or before the exam year, taking the most recent such version".
 * Versions with no assessment date are ignored for selection.
 */
export function versionInForceForYear(
  versions: readonly SpecificationVersion[],
  examYear: number,
): SpecificationVersion | null {
  const yearEnd = Date.UTC(examYear, 11, 31);
  const eligible = versions
    .map((version) => ({
      version,
      at: toTimestamp(version.firstAssessment),
    }))
    .filter((entry): entry is { version: SpecificationVersion; at: number } => entry.at !== null)
    .filter((entry) => entry.at <= yearEnd)
    .sort((a, b) => a.at - b.at);

  if (!eligible.length) return null;
  return eligible[eligible.length - 1].version;
}

/** Versions that have been superseded by a later assessed version. */
export function supersededVersions(
  versions: readonly SpecificationVersion[],
): SpecificationVersion[] {
  const assessed = versions
    .filter((version) => toTimestamp(version.firstAssessment) !== null)
    .sort(
      (a, b) =>
        (toTimestamp(a.firstAssessment) ?? 0) -
        (toTimestamp(b.firstAssessment) ?? 0),
    );
  if (assessed.length < 2) return [];
  // Every assessed version except the newest one in force has been superseded.
  return assessed.slice(0, -1);
}

export type VersionStatus = {
  version: SpecificationVersion;
  status: SpecificationVersionStatus;
  /** Year in which this version first applies to an assessment. */
  firstAssessmentYear: number | null;
};

export function versionStatuses(
  versions: readonly SpecificationVersion[],
): VersionStatus[] {
  const superseded = new Set(supersededVersions(versions).map((v) => v.version));
  return versions.map((version) => {
    const at = toTimestamp(version.firstAssessment);
    return {
      version,
      status: superseded.has(version.version)
        ? "superseded"
        : at === null
          ? "draft"
          : "current",
      firstAssessmentYear: at === null ? null : new Date(at).getUTCFullYear(),
    };
  });
}

/** A learning objective attached to a specification and (optionally) a topic. */
export type LearningObjective = {
  id: string;
  specificationId: string;
  topicId?: string | null;
  /** Reference code, e.g. "7402.1.1". */
  code: string;
  statement: string;
  commandWord?: string | null;
  assessmentObjective?: string | null;
  sortOrder?: number;
  /** True only when the statement has been checked against the board document. */
  isVerified?: boolean;
};

export type TopicCoverage = {
  total: number;
  covered: number;
  percentage: number;
  byChapter: {
    chapter: string;
    total: number;
    covered: number;
  }[];
};

export type CoverageTopic = {
  id: string;
  name: string;
  /** Chapter (or unit) the topic sits under. */
  chapter?: string | null;
  completed: boolean;
};

/**
 * Compute specification coverage from a list of topics and their completion.
 */
export function computeTopicCoverage(
  topics: readonly CoverageTopic[],
): TopicCoverage {
  const total = topics.length;
  const covered = topics.filter((topic) => topic.completed).length;
  const chapters = new Map<string, { total: number; covered: number }>();
  for (const topic of topics) {
    const key = topic.chapter ?? "Unassigned";
    const entry = chapters.get(key) ?? { total: 0, covered: 0 };
    entry.total += 1;
    if (topic.completed) entry.covered += 1;
    chapters.set(key, entry);
  }
  return {
    total,
    covered,
    percentage: total ? Math.round((covered / total) * 100) : 0,
    byChapter: [...chapters.entries()]
      .map(([chapter, counts]) => ({ chapter, ...counts }))
      .sort((a, b) => a.chapter.localeCompare(b.chapter)),
  };
}

/**
 * Validate a specification code against the board's documented code format.
 * Returns `null` when the code is plausible, otherwise a human-readable reason.
 */
export function validateSpecificationCode(
  board: ExamBoard,
  code: string,
): string | null {
  const trimmed = code.trim();
  if (!trimmed) return "Specification code is required";
  if (trimmed.length > 40) return "Specification code is too long";

  const patterns: Record<ExamBoard, RegExp> = {
    // AQA: four-digit subject code, optionally followed by a paper number.
    AQA: /^\d{4}(\/\d{1,2}[A-Z]?)?$/,
    // Pearson Edexcel: letter-number unit code, optionally with a paper code.
    "Pearson Edexcel": /^[0-9][A-Z]{2}\d(\/\d{1,2}[A-Z]?)?$/,
    // OCR: letter-number code, optionally followed by /paper number.
    OCR: /^[A-Z]\d{3}(\/\d{1,2})?$/,
    // WJEC / Eduqas: alphanumeric subject code with an optional unit suffix.
    WJEC: /^[A-Z0-9]{3,6}(U\d{1,2}(-\d)?)?$/,
    Eduqas: /^[A-Z0-9]{3,6}(U\d{1,2}(-\d)?)?$/,
    // CCEA: letter-number code with an optional paper number.
    CCEA: /^[A-Z]\d{3}(\/\d{1,2})?$/,
  };

  if (!patterns[board].test(trimmed)) {
    return `${code} does not look like a ${board} specification code`;
  }
  return null;
}

/**
 * Describe how a board's specification codes are constructed, for the UI.
 */
export function specificationCodeHint(board: ExamBoard): string {
  switch (board) {
    case "AQA":
      return "Four digits, for example 7402 (A-level Biology) or 7402/1 for a paper.";
    case "Pearson Edexcel":
      return "Letter and two digits, for example 9MA0 (International A level Mathematics) or 4PH1/1P for a paper.";
    case "OCR":
      return "A letter and three digits, for example H432 (A level Chemistry) or J277/01 for a paper.";
    case "WJEC":
    case "Eduqas":
      return "Subject code with an optional unit suffix, for example C720 or C111U10-1.";
    case "CCEA":
      return "A letter and three digits, for example H201 (A level History) or H201/1 for a paper.";
  }
}

/** Levels a board assesses at, used to validate subject records. */
export function levelsForBoard(board: ExamBoard): readonly QualificationLevel[] {
  switch (board) {
    case "Pearson Edexcel":
      return ["International GCSE", "International A-level"];
    default:
      return ["GCSE", "A-level"];
  }
}
