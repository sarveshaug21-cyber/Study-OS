import { test } from "node:test";
import assert from "node:assert/strict";
import {
  COMMAND_WORDS,
  assessmentObjectivesFor,
  computeTopicCoverage,
  findCommandWord,
  specificationCodeHint,
  validateSpecificationCode,
  versionInForceForYear,
  versionStatuses,
  supersededVersions,
  type SpecificationVersion,
} from "../lib/specifications";
import { EXAM_BOARDS } from "../lib/qualifications";

const versions: SpecificationVersion[] = [
  {
    version: "2016.1",
    title: "2016 specification",
    firstTeaching: "2016-09-01",
    firstAssessment: "2018-06-01",
  },
  {
    version: "2021.1",
    title: "2021 specification",
    firstTeaching: "2021-09-01",
    firstAssessment: "2023-06-01",
    changeSummary: "Content refreshed.",
  },
  {
    version: "2024.1",
    title: "2024 specification",
    firstTeaching: "2024-09-01",
    firstAssessment: "2026-06-01",
  },
];

test("the version in force is the latest one assessed by that year", () => {
  assert.equal(versionInForceForYear(versions, 2020)?.version, "2016.1");
  assert.equal(versionInForceForYear(versions, 2023)?.version, "2021.1");
  assert.equal(versionInForceForYear(versions, 2026)?.version, "2024.1");
  assert.equal(versionInForceForYear(versions, 2030)?.version, "2024.1");
});

test("no version is in force before the first assessment", () => {
  assert.equal(versionInForceForYear(versions, 2017), null);
  assert.equal(versionInForceForYear([], 2024), null);
});

test("superseded versions are identified correctly", () => {
  const superseded = supersededVersions(versions).map((v) => v.version);
  assert.deepEqual(superseded, ["2016.1", "2021.1"]);
});

test("version statuses label current, superseded and draft", () => {
  const statuses = versionStatuses(versions);
  assert.equal(statuses.find((s) => s.version.version === "2024.1")?.status, "current");
  assert.equal(statuses.find((s) => s.version.version === "2016.1")?.status, "superseded");
  const draft = versionStatuses([
    { version: "draft-1", title: "Draft" },
  ]);
  assert.equal(draft[0].status, "draft");
});

test("dates may be supplied as Date objects or ISO strings", () => {
  const withDates: SpecificationVersion[] = [
    { version: "a", title: "A", firstAssessment: new Date("2020-06-01") },
    { version: "b", title: "B", firstAssessment: "2024-06-01" },
  ];
  assert.equal(versionInForceForYear(withDates, 2022)?.version, "a");
  assert.equal(versionInForceForYear(withDates, 2025)?.version, "b");
});

test("every board publishes assessment objectives", () => {
  for (const board of EXAM_BOARDS) {
    const objectives = assessmentObjectivesFor(board);
    assert.ok(objectives.length >= 3, board);
    for (const objective of objectives) {
      assert.match(objective.code, /^AO\d$/, board);
      assert.ok(objective.name.length >= 3, board);
      assert.ok(objective.description.length > 20, board);
    }
  }
});

test("command words describe intent and full-mark requirements", () => {
  assert.ok(COMMAND_WORDS.length >= 10);
  for (const command of COMMAND_WORDS) {
    assert.ok(command.word.length > 2);
    assert.ok(command.intent.length > 10);
    assert.ok(command.looksLike.length > 10);
    assert.ok([1, 2, 3].includes(command.depth));
  }
});

test("command words can be looked up from a question", () => {
  assert.equal(findCommandWord("State")?.depth, 1);
  assert.equal(findCommandWord("explain")?.word, "Explain");
  assert.equal(findCommandWord("Evaluate")?.depth, 3);
  assert.equal(findCommandWord("nonsense"), null);
});

test("topic coverage is computed per chapter", () => {
  const coverage = computeTopicCoverage([
    { id: "1", name: "A", chapter: "Unit 1", completed: true },
    { id: "2", name: "B", chapter: "Unit 1", completed: false },
    { id: "3", name: "C", chapter: "Unit 2", completed: true },
  ]);
  assert.equal(coverage.total, 3);
  assert.equal(coverage.covered, 2);
  assert.equal(coverage.percentage, 67);
  assert.equal(coverage.byChapter.length, 2);
  assert.equal(coverage.byChapter[0].chapter, "Unit 1");
  assert.equal(coverage.byChapter[0].covered, 1);
});

test("coverage of an empty specification is zero, not NaN", () => {
  const coverage = computeTopicCoverage([]);
  assert.equal(coverage.total, 0);
  assert.equal(coverage.covered, 0);
  assert.equal(coverage.percentage, 0);
});

test("specification codes are validated per board", () => {
  assert.equal(validateSpecificationCode("AQA", "7402"), null);
  assert.equal(validateSpecificationCode("AQA", "7402/1"), null);
  assert.ok(validateSpecificationCode("AQA", "9MA0"));
  assert.equal(validateSpecificationCode("Pearson Edexcel", "9MA0"), null);
  assert.equal(validateSpecificationCode("Pearson Edexcel", "4PH1/1P"), null);
  assert.equal(validateSpecificationCode("OCR", "H432"), null);
  assert.equal(validateSpecificationCode("WJEC", "C720"), null);
  assert.equal(validateSpecificationCode("Eduqas", "C111U10-1"), null);
  assert.equal(validateSpecificationCode("CCEA", "H201"), null);
  assert.ok(validateSpecificationCode("CCEA", "9MA0"));
  assert.ok(validateSpecificationCode("AQA", ""));
});

test("every board explains its code format", () => {
  for (const board of EXAM_BOARDS) {
    assert.ok(specificationCodeHint(board).length > 20, board);
  }
});
