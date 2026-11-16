import { test } from "node:test";
import assert from "node:assert/strict";
import { examMaterialsAllowed, sanitizeHfPath, hfFileHref, formatBytes, splitHfPath, HF_ROOT } from "../lib/hf-shared";

test("examMaterialsAllowed denies everyone when the allowlist is unset", () => {
  assert.equal(examMaterialsAllowed("someone@example.com", undefined), false);
  assert.equal(examMaterialsAllowed("someone@example.com", ""), false);
  assert.equal(examMaterialsAllowed("someone@example.com", "   "), false);
  assert.equal(examMaterialsAllowed(undefined, "someone@example.com"), false);
});

test("examMaterialsAllowed matches listed emails case-insensitively", () => {
  const list = "Alpha@Example.com, beta@example.com";
  assert.equal(examMaterialsAllowed("alpha@example.com", list), true);
  assert.equal(examMaterialsAllowed("ALPHA@EXAMPLE.COM", list), true);
  assert.equal(examMaterialsAllowed("beta@example.com", list), true);
  assert.equal(examMaterialsAllowed("gamma@example.com", list), false);
  assert.equal(examMaterialsAllowed("", list), false);
  assert.equal(examMaterialsAllowed(undefined, list), false);
});

test("examMaterialsAllowed ignores blank entries", () => {
  const list = " alpha@example.com , , ";
  assert.equal(examMaterialsAllowed("alpha@example.com", list), true);
  assert.equal(examMaterialsAllowed("beta@example.com", list), false);
});

test("sanitizeHfPath rejects traversal and foreign roots", () => {
  assert.equal(sanitizeHfPath(undefined), HF_ROOT);
  assert.equal(sanitizeHfPath("past-papers/aqa"), "past-papers/aqa");
  assert.equal(sanitizeHfPath("../secrets"), null);
  assert.equal(sanitizeHfPath("past-papers/../../etc"), null);
  assert.equal(sanitizeHfPath("/etc/passwd"), null);
  assert.equal(sanitizeHfPath("other-root/x"), null);
});

test("splitHfPath and hfFileHref", () => {
  assert.deepEqual(splitHfPath("past-papers/aqa/b"), ["past-papers", "aqa", "b"]);
  assert.equal(hfFileHref("past-papers/aqa/b.pdf"), "/api/hf/file?path=past-papers/aqa/b.pdf");
  assert.equal(hfFileHref("past-papers/a b.pdf", true), "/api/hf/file?path=past-papers/a%20b.pdf&download=1");
});

test("formatBytes", () => {
  assert.equal(formatBytes(900), "900 B");
  assert.equal(formatBytes(2048), "2.0 KB");
  assert.equal(formatBytes(5 * 1024 * 1024), "5.0 MB");
});
