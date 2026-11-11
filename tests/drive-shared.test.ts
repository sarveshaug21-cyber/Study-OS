import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeRelativePath, sanitizeFileName, classifyImportFile, dedupeDecision, buildTree,
  isSupportedName, exportSpec, fileExtension, MAX_FILE_BYTES, MAX_WORKSPACE_EXPORT_BYTES,
} from "../lib/drive-shared";

describe("sanitizeRelativePath", () => {
  it("accepts a simple nested path", () => {
    const r = sanitizeRelativePath("Physics/Topic 5/motion.pdf");
    assert.deepEqual(r, { ok: true, segments: ["Physics", "Topic 5", "motion.pdf"] });
  });
  it("accepts null/undefined as root", () => {
    assert.deepEqual(sanitizeRelativePath(undefined), { ok: true, segments: [] });
    assert.deepEqual(sanitizeRelativePath(""), { ok: true, segments: [] });
  });
  it("rejects traversal", () => {
    assert.equal(sanitizeRelativePath("../secret.txt").ok, false);
    assert.equal(sanitizeRelativePath("a/../../b.txt").ok, false);
    assert.equal(sanitizeRelativePath("a/b/..").ok, false);
  });
  it("normalises windows separators and rejects NULs", () => {
    assert.deepEqual(sanitizeRelativePath("a\\b\\c.txt"), { ok: true, segments: ["a", "b", "c.txt"] });
    assert.equal(sanitizeRelativePath("a/b\0c.txt").ok, false);
  });
  it("collapses dot segments and empty parts", () => {
    assert.deepEqual(sanitizeRelativePath("a/./b//c.txt"), { ok: true, segments: ["a", "b", "c.txt"] });
  });
  it("rejects overlong segments and too-deep paths", () => {
    assert.equal(sanitizeRelativePath("x/" + "a".repeat(101)).ok, false);
    assert.equal(sanitizeRelativePath(Array.from({ length: 11 }, (_, i) => `d${i}`).join("/") + "/f.pdf").ok, false);
  });
  it("strips filesystem-hostile characters from segments", () => {
    const r = sanitizeRelativePath('exam: 2024*?"<>|.pdf');
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.segments[0].includes(":"), false);
  });
});

describe("sanitizeFileName", () => {
  it("accepts normal names", () => assert.deepEqual(sanitizeFileName("paper.pdf"), { ok: true, name: "paper.pdf" }));
  it("rejects empty and dot names", () => {
    assert.equal(sanitizeFileName("   ").ok, false);
    assert.equal(sanitizeFileName("..").ok, false);
  });
  it("rejects overlong names", () => assert.equal(sanitizeFileName("x".repeat(101)).ok, false));
});

describe("classifyImportFile", () => {
  it("copies regular supported files", () => {
    assert.deepEqual(classifyImportFile("a.pdf", "application/pdf", 1000), { action: "copy" });
    assert.deepEqual(classifyImportFile("b.txt", "text/plain", 10), { action: "copy" });
    assert.deepEqual(classifyImportFile("c.JPG", "image/jpeg", 10), { action: "copy" });
  });
  it("exports Google Workspace documents to OOXML", () => {
    const r = classifyImportFile("notes", "application/vnd.google-apps.document", 1000);
    assert.equal(r.action, "export");
    if (r.action === "export") assert.equal(r.ext, "docx");
    const s = classifyImportFile("deck", "application/vnd.google-apps.presentation", 1000);
    assert.equal(s.action === "export" && s.ext, "pptx");
  });
  it("rejects Google Forms and exports over the size cap", () => {
    assert.equal(classifyImportFile("f", "application/vnd.google-apps.form", 1).action, "skipped");
    assert.equal(classifyImportFile("big", "application/vnd.google-apps.document", MAX_WORKSPACE_EXPORT_BYTES + 1).action, "skipped");
  });
  it("rejects files over the size cap and unsupported types", () => {
    assert.equal(classifyImportFile("huge.pdf", "application/pdf", MAX_FILE_BYTES + 1).action, "skipped");
    assert.equal(classifyImportFile("run.exe", "application/x-msdownload", 1000).action, "skipped");
  });
});

describe("exportSpec", () => {
  it("maps the exportable Workspace types", () => {
    assert.ok(exportSpec("application/vnd.google-apps.document"));
    assert.equal(exportSpec("application/vnd.google-apps.form"), null);
  });
});

describe("dedupeDecision", () => {
  it("no existing entries → import", () => {
    assert.equal(dedupeDecision(undefined, { name: "a.pdf", md5: "x" }), "import");
    assert.equal(dedupeDecision([], { name: "a.pdf", md5: "x" }), "import");
  });
  it("matching md5 → duplicate", () => {
    assert.equal(dedupeDecision([{ name: "a.pdf", md5Checksum: "abc" }], { name: "a.pdf", md5: "abc" }), "duplicate");
  });
  it("matching size → duplicate", () => {
    assert.equal(dedupeDecision([{ name: "a.pdf", size: "123" }], { name: "a.pdf", size: 123 }), "duplicate");
  });
  it("same name but different content → import", () => {
    assert.equal(dedupeDecision([{ name: "a.pdf", md5Checksum: "abc", size: "1" }], { name: "a.pdf", md5: "def", size: 2 }), "import");
  });
});

describe("isSupportedName / fileExtension", () => {
  it("accepts by extension even with odd mime types", () => assert.equal(isSupportedName("paper.PDF", "application/octet-stream"), true));
  it("accepts by mime type", () => assert.equal(isSupportedName("noext", "text/plain"), true));
  it("rejects unknown types", () => assert.equal(isSupportedName("app.exe", "application/x-msdownload"), false));
  it("extracts extension case-insensitively", () => assert.equal(fileExtension("A.BcD.pptx"), "pptx"));
});

describe("buildTree", () => {
  it("nests files by folderPath", () => {
    const tree = buildTree([
      { id: "1", name: "a.pdf", folderPath: "Chapter 1" },
      { id: "2", name: "b.pdf", folderPath: "Chapter 1/Sub" },
      { id: "3", name: "root.pdf" },
    ]);
    assert.equal(tree.files.length, 1);
    const ch1 = tree.children.get("Chapter 1")!;
    assert.equal(ch1.files.length, 1);
    assert.equal(ch1.children.get("Sub")!.files[0].name, "b.pdf");
  });
});
