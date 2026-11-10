import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateSource, dedupe, dryRun } from "../lib/import/validate";
describe("import pipeline", () => {
  it("rejects invalid url", () => assert.equal(validateSource({ id:"x", board:"AQA" as any, qualification:"GCSE", subject:"Biology", resourceType:"specification", title:"t", url:"not-a-url", verified:false, verifiedOn:"", status:"unverified" }).ok, false));
  it("accepts valid record", () => assert.equal(validateSource({ id:"aqa-gcse-bio-spec", board:"AQA" as any, qualification:"GCSE", subject:"Biology", resourceType:"specification", title:"AQA GCSE Biology", url:"https://www.aqa.org.uk/x", verified:true, verifiedOn:"2026-11-10", status:"verified" }).ok, true));
  it("dedupes by id", () => {
    const e = [{ id:"a", board:"AQA" as any, qualification:"GCSE", subject:"Biology", resourceType:"specification", title:"t", url:"https://www.aqa.org.uk/x", verified:false, verifiedOn:"", status:"unverified" as const }];
    const inc = [{ ...e[0] }];
    const { newRecords, duplicates } = dedupe(e as any, inc as any);
    assert.equal(newRecords.length, 0); assert.equal(duplicates.length, 1);
  });
  it("dry run summary", () => {
    const inc = [{ id:"new1", board:"AQA" as any, qualification:"GCSE", subject:"Biology", resourceType:"specification", title:"t", url:"https://www.aqa.org.uk/x", verified:false, verifiedOn:"", status:"unverified" as const }];
    const r = dryRun([], inc as any);
    assert.equal(r.summary.new, 1); assert.equal(r.summary.invalid, 0);
  });
  it("warns on non-official verified url", () => {
    const v = validateSource({ id:"x", board:"AQA" as any, qualification:"GCSE", subject:"Biology", resourceType:"specification", title:"t", url:"https://example.com/x", verified:true, verifiedOn:"2026-11-10", status:"verified" });
    assert.ok(v.warnings.length > 0);
  });
});
