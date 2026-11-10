import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildSystemPrompt, isYearGroup, YEAR_GROUPS } from "../lib/ai/prompts";
describe("prompts", () => {
  it("rejects unsupported years", () => assert.equal(isYearGroup("Year 9"), false));
  it("accepts all four years", () => { for (const y of YEAR_GROUPS) assert.equal(isYearGroup(y), true); });
  it("core prompt present", () => assert.match(buildSystemPrompt({ yearGroup: "Year 10" }), /Study OS Tutor/));
  it("year profile present", () => assert.match(buildSystemPrompt({ yearGroup: "Year 13" }), /Year 13/));
  it("exam board context", () => assert.match(buildSystemPrompt({ yearGroup: "Year 11", examBoard: "AQA" }), /AQA/));
  it("subject/topic context", () => assert.match(buildSystemPrompt({ yearGroup: "Year 12", subject: "Mathematics", topic: "Integration" }), /Mathematics/));
  it("no Year 7/8/9 in selector", () => assert.equal(YEAR_GROUPS.includes("Year 9" as never), false));
});
