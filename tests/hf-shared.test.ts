import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeHfPath, splitHfPath, formatBytes, hfFileHref, HF_ROOT } from "../lib/hf-shared";

test("sanitizeHfPath accepts default root", () => {
  assert.equal(sanitizeHfPath(undefined), HF_ROOT);
  assert.equal(sanitizeHfPath(""), HF_ROOT);
  assert.equal(sanitizeHfPath("past-papers"), HF_ROOT);
});

test("sanitizeHfPath accepts nested folder", () => {
  assert.equal(sanitizeHfPath("past-papers/aqa/gcse-mathematics"), "past-papers/aqa/gcse-mathematics");
  assert.equal(sanitizeHfPath("/past-papers/ccea/gcse-biology-2017/mark-schemes/2026/"), "past-papers/ccea/gcse-biology-2017/mark-schemes/2026");
});

test("sanitizeHfPath rejects traversal and absolute paths outside root", () => {
  assert.equal(sanitizeHfPath("../etc/passwd"), null);
  assert.equal(sanitizeHfPath("past-papers/../../etc/passwd"), null);
  assert.equal(sanitizeHfPath("/etc/passwd"), null);
  assert.equal(sanitizeHfPath("other/thing"), null);
  assert.equal(sanitizeHfPath("past-papers/../../past-papers"), null);
});

test("splitHfPath splits cleanly", () => {
  assert.deepEqual(splitHfPath("past-papers/aqa"), ["past-papers", "aqa"]);
  assert.deepEqual(splitHfPath(HF_ROOT), [HF_ROOT]);
});

test("formatBytes human-readable", () => {
  assert.equal(formatBytes(523), "523 B");
  assert.equal(formatBytes(2048), "2.0 KB");
  assert.equal(formatBytes(5 * 1024 * 1024), "5.0 MB");
});

test("hfFileHref builds app proxy URLs", () => {
  assert.equal(hfFileHref("past-papers/aqa/x.pdf"), "/api/hf/file?path=past-papers/aqa/x.pdf");
  assert.equal(hfFileHref("past-papers/a b.pdf", true), "/api/hf/file?path=past-papers/a%20b.pdf&download=1");
});
