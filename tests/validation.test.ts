import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { requireString, requireUuid, requireIntInRange, requireEmail, isUuid, isAdminEmail, ValidationError } from "../lib/validation";

describe("validation", () => {
  it("rejects empty strings", () => assert.throws(() => requireString({ a: "  " }, "a"), ValidationError));
  it("rejects non-uuid", () => assert.throws(() => requireUuid({ id: "not-a-uuid" }, "id"), ValidationError));
  it("accepts uuid", () => assert.equal(requireUuid({ id: "550e8400-e29b-41d4-a716-446655440000" }, "id"), "550e8400-e29b-41d4-a716-446655440000"));
  it("rejects out-of-range int", () => assert.throws(() => requireIntInRange({ n: 5000 }, "n", 0, 100), ValidationError));
  it("rejects bad email", () => assert.throws(() => requireEmail({ e: "nope" }, "e"), ValidationError));
  it("detects uuid", () => assert.equal(isUuid("x"), false));
});

describe("admin gate", () => {
  it("deny-all when unconfigured", () => assert.equal(isAdminEmail("a@b.com", undefined), false));
  it("allows exact match case-insensitively", () => assert.equal(isAdminEmail("Admin@X.com", "admin@x.com, other@y.com"), true));
  it("rejects non-admin", () => assert.equal(isAdminEmail("mallory@evil.com", "admin@x.com"), false));
  it("rejects missing email", () => assert.equal(isAdminEmail(undefined, "admin@x.com"), false));
});
