import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateAndDeriveKey } from "../lib/google-drive-key";
describe("google drive encryption key", () => {
  it("throws when unset", () => assert.throws(() => validateAndDeriveKey(undefined)));
  it("accepts 32-byte hex", () => { const k = validateAndDeriveKey("0".repeat(64)); assert.equal(k.length, 32); });
  it("accepts base64 of 32 bytes", () => { const k = validateAndDeriveKey(Buffer.alloc(32).toString("base64")); assert.equal(k.length, 32); });
  it("rejects short key", () => assert.throws(() => validateAndDeriveKey("tooshort")));
  it("rejects 16-byte hex", () => assert.throws(() => validateAndDeriveKey("0".repeat(32))));
});
