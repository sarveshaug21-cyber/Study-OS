import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { suggestOrder, estimateSessions } from "../lib/scheduler";
describe("scheduler", () => {
  it("orders high-priority soon-due first", () => {
    const tasks = [
      { id: "a", title: "A", durationMinutes: 30, priority: "low" as const, dueAt: new Date(Date.now() + 100*3600000), completed: false },
      { id: "b", title: "B", durationMinutes: 30, priority: "high" as const, dueAt: new Date(Date.now() + 3600000), completed: false },
    ];
    assert.equal(suggestOrder(tasks)[0].id, "b");
  });
  it("estimates sessions", () => assert.equal(estimateSessions(100, 45), 3));
});
