import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BOARD_INTELLIGENCE,
  boardAssessment,
  boardSessions,
  boardTiering,
  getBoardIntelligence,
  getBoardOverview,
  boardOverviews,
  supportedBoardQualifications,
} from "../lib/exam-boards";
import { BOARD_QUALIFICATIONS, EXAM_BOARDS } from "../lib/qualifications";

test("every board has an intelligence record", () => {
  for (const board of EXAM_BOARDS) {
    const record = getBoardIntelligence(board);
    assert.equal(record.board, board);
    assert.ok(record.organisation.length > 3, board);
    assert.ok(record.summary.length > 40, board);
    assert.ok(record.officialUrl.startsWith("https://"), board);
    assert.ok(record.pastPapersUrl.startsWith("https://"), board);
    assert.ok(record.specificationUrl.startsWith("https://"), board);
    assert.ok(record.codeFormat.length > 10, board);
    assert.ok(record.assessmentStyle.length > 20, board);
  }
});

test("board intelligence qualifications match the canonical architecture", () => {
  for (const board of EXAM_BOARDS) {
    assert.deepEqual(
      [...BOARD_INTELLIGENCE[board].qualifications],
      [...BOARD_QUALIFICATIONS[board]],
      board,
    );
  }
});

test("each board defines assessment structure for every qualification", () => {
  for (const board of EXAM_BOARDS) {
    for (const level of BOARD_QUALIFICATIONS[board]) {
      const assessment = boardAssessment(board, level);
      assert.ok(assessment.components.length > 10, `${board} ${level}`);
      assert.ok(assessment.assessedBy.length > 3, `${board} ${level}`);
      assert.ok(assessment.coursework.length > 3, `${board} ${level}`);
      assert.ok(assessment.resits.length > 3, `${board} ${level}`);
    }
  }
});

test("tiering is only claimed where it exists", () => {
  assert.equal(boardTiering("Pearson Edexcel", "International GCSE").supported, true);
  assert.deepEqual(
    [...boardTiering("Pearson Edexcel", "International GCSE").tiers],
    ["Foundation", "Intermediate", "Higher"],
  );
  assert.equal(boardTiering("AQA", "GCSE").supported, false);
  assert.equal(boardTiering("WJEC", "A-level").supported, false);
  assert.equal(boardTiering("CCEA", "GCSE").tiers.length, 0);
});

test("tiering subjects are always named when tiering is supported", () => {
  for (const board of EXAM_BOARDS) {
    for (const level of BOARD_QUALIFICATIONS[board]) {
      const tiering = boardTiering(board, level);
      if (tiering.supported) {
        assert.ok(tiering.subjects.length > 0, `${board} ${level}`);
        assert.ok(tiering.note.length > 10, `${board} ${level}`);
      }
    }
  }
});

test("exam sessions are ordered and unique", () => {
  for (const board of EXAM_BOARDS) {
    const sessions = boardSessions(board);
    assert.ok(sessions.length >= 3, board);
    const ids = new Set(sessions.map((s) => s.id));
    assert.equal(ids.size, sessions.length, board);
    const orders = sessions.map((s) => s.order);
    assert.deepEqual([...orders].sort((a, b) => a - b), orders, board);
  }
});

test("supported board/qualification pairs cover every board", () => {
  const pairs = supportedBoardQualifications();
  const boards = new Set(pairs.map((p) => p.board));
  assert.equal(boards.size, EXAM_BOARDS.length);
  assert.equal(pairs.length, 12);
});

test("board overviews expose stage-aware qualification entries", () => {
  const aqa = getBoardOverview("AQA");
  assert.equal(aqa.board, "AQA");
  assert.ok(aqa.organisation.length > 3);
  assert.equal(aqa.qualifications.length, 2);
  assert.deepEqual(
    aqa.qualifications.map((q) => q.level),
    ["GCSE", "A-level"],
  );
  for (const entry of aqa.qualifications) {
    assert.ok(entry.stage === "Key Stage 4" || entry.stage === "Key Stage 5");
    assert.ok(entry.years.length > 0);
    assert.equal(typeof entry.international, "boolean");
  }

  const edexcel = getBoardOverview("Pearson Edexcel");
  assert.match(edexcel.qualifications[0].level, /International/);
  assert.equal(edexcel.qualifications[0].stage, "Key Stage 4");

  const all = boardOverviews();
  assert.equal(all.length, EXAM_BOARDS.length);
  assert.deepEqual(all.map((b) => b.board), [...EXAM_BOARDS]);
});
