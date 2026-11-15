import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BOARD_QUALIFICATIONS,
  EXAM_BOARDS,
  QUALIFICATION_ARCHITECTURE,
  QUALIFICATION_LEVELS,
  availableQualificationsForBoard,
  boardOffersQualification,
  boardsForQualification,
  defaultYearGroupForQualification,
  getGradingScale,
  gradeFromPercentage,
  isExamBoard,
  isQualificationLevel,
  passingGrades,
  validateBoardQualification,
  yearGroupsForQualification,
  stageFor,
  stageLabel,
  getQualificationOverview,
  type QualificationStage,
} from "../lib/qualifications";

test("exam board list matches the six supported awarding bodies", () => {
  assert.equal(EXAM_BOARDS.length, 6);
  assert.deepEqual(
    [...EXAM_BOARDS],
    ["AQA", "Pearson Edexcel", "OCR", "WJEC", "Eduqas", "CCEA"],
  );
});

test("qualification list covers GCSE, IGCSE, A-level and International A-level", () => {
  assert.deepEqual(
    [...QUALIFICATION_LEVELS],
    ["GCSE", "International GCSE", "A-level", "International A-level"],
  );
});

test("Pearson Edexcel awards only the international qualifications", () => {
  assert.equal(boardOffersQualification("Pearson Edexcel", "GCSE"), false);
  assert.equal(boardOffersQualification("Pearson Edexcel", "A-level"), false);
  assert.equal(boardOffersQualification("Pearson Edexcel", "International GCSE"), true);
  assert.equal(boardOffersQualification("Pearson Edexcel", "International A-level"), true);
});

test("English boards award GCSE and A-level", () => {
  for (const board of ["AQA", "OCR", "WJEC", "Eduqas", "CCEA"] as const) {
    assert.equal(boardOffersQualification(board, "GCSE"), true, board);
    assert.equal(boardOffersQualification(board, "A-level"), true, board);
  }
});

test("every board/qualification pairing is mutually consistent", () => {
  for (const board of EXAM_BOARDS) {
    for (const level of QUALIFICATION_LEVELS) {
      const expected = BOARD_QUALIFICATIONS[board].includes(level);
      assert.equal(boardOffersQualification(board, level), expected);
    }
  }
});

test("availableQualificationsForBoard never returns an empty list", () => {
  for (const board of EXAM_BOARDS) {
    assert.ok(availableQualificationsForBoard(board).length > 0, board);
  }
});

test("boardsForQualification resolves the inverse mapping", () => {
  assert.deepEqual(
    [...boardsForQualification("GCSE")],
    ["AQA", "OCR", "WJEC", "Eduqas", "CCEA"],
  );
  assert.deepEqual(
    [...boardsForQualification("International A-level")],
    ["Pearson Edexcel"],
  );
});

test("validateBoardQualification rejects impossible pairings with a reason", () => {
  const message = validateBoardQualification("Pearson Edexcel", "GCSE");
  assert.ok(message);
  assert.match(message!, /does not award/);
  assert.equal(validateBoardQualification("AQA", "GCSE"), null);
  assert.equal(validateBoardQualification("AQA", "A-level"), null);
  assert.ok(validateBoardQualification("AQA", "International A-level"));
  assert.ok(validateBoardQualification("Nope", "GCSE"));
  assert.ok(validateBoardQualification("AQA", "BTEC"));
});

test("type guards accept only known values", () => {
  assert.equal(isExamBoard("AQA"), true);
  assert.equal(isExamBoard("aqa"), false);
  assert.equal(isQualificationLevel("GCSE"), true);
  assert.equal(isQualificationLevel("GCSE Level"), false);
});

test("GCSE and International GCSE are studied in Years 10-11", () => {
  assert.deepEqual([...yearGroupsForQualification("GCSE")], ["Year 10", "Year 11"]);
  assert.deepEqual([...yearGroupsForQualification("International GCSE")], [
    "Year 10",
    "Year 11",
  ]);
  assert.equal(defaultYearGroupForQualification("GCSE"), "Year 11");
});

test("A-level qualifications are studied in Years 12-13", () => {
  assert.deepEqual([...yearGroupsForQualification("A-level")], ["Year 12", "Year 13"]);
  assert.deepEqual([...yearGroupsForQualification("International A-level")], [
    "Year 12",
    "Year 13",
  ]);
  assert.equal(defaultYearGroupForQualification("A-level"), "Year 13");
  assert.equal(defaultYearGroupForQualification(null), null);
  assert.equal(defaultYearGroupForQualification("GCSE Level"), null);
});

test("qualification metadata is complete for every level", () => {
  for (const level of QUALIFICATION_LEVELS) {
    const meta = QUALIFICATION_ARCHITECTURE[level];
    assert.equal(meta.key, level);
    assert.ok(meta.name.length > 0);
    assert.ok(meta.assessmentModel.length > 20);
    assert.ok(meta.components.length > 0);
    assert.ok(meta.progression.length > 0);
    assert.equal(typeof meta.international, "boolean");
  }
});

test("9-1 scale is used for GCSE and A*-E for A-level", () => {
  assert.equal(getGradingScale("GCSE").id, "nine-to-one");
  assert.equal(getGradingScale("International GCSE").id, "nine-to-one");
  assert.equal(getGradingScale("A-level").id, "a-level");
  assert.equal(getGradingScale("International A-level").id, "a-level");
});

test("passing grades are correct for each scale", () => {
  assert.deepEqual(
    passingGrades("GCSE").map((g) => g.grade),
    ["4", "3"],
  );
  assert.deepEqual(
    passingGrades("A-level").map((g) => g.grade),
    ["A*", "A", "B", "C", "D", "E"],
  );
});

test("percentages map to sensible grades", () => {
  assert.equal(gradeFromPercentage("GCSE", 85), "9");
  assert.equal(gradeFromPercentage("GCSE", 72), "8");
  assert.equal(gradeFromPercentage("GCSE", 62), "7");
  assert.equal(gradeFromPercentage("GCSE", 42), "4");
  assert.equal(gradeFromPercentage("GCSE", 32), "3");
  assert.equal(gradeFromPercentage("A-level", 82), "A*");
  assert.equal(gradeFromPercentage("A-level", 55), "C");
  assert.equal(gradeFromPercentage("A-level", 35), "E");
  assert.equal(gradeFromPercentage("GCSE", Number.NaN), null);
});

test("grade boundaries are clamped to 0-100", () => {
  assert.equal(gradeFromPercentage("GCSE", 120), "9");
  assert.equal(gradeFromPercentage("GCSE", -5), "1");
test("qualification stage and overview", () => {
  assert.equal(stageFor("GCSE"), "Key Stage 4");
  assert.equal(stageFor("International A-level"), "Key Stage 5");
  assert.equal(stageLabel("A-level"), "Further (ages 16–18)");
  assert.equal(stageLabel("GCSE"), "Secondary (ages 14–16)");
  const overview = getQualificationOverview("International GCSE");
  assert.equal(overview.level, "International GCSE");
  assert.equal(overview.stage, "Key Stage 4");
  assert.deepEqual(overview.years, ["Year 10", "Year 11"]);
  assert.equal(overview.finalYear, "Year 11");
  assert.equal(overview.international, true);
});
});
