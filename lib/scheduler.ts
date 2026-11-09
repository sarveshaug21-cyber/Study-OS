// Lightweight study scheduler adapted from studyflow-timetable's adaptivePlanner/scheduler ideas,
// rewritten for Study OS's Drizzle/task model (no copy-paste, no new deps).
export type SchedulerInput = { id: string; title: string; durationMinutes: number; priority: "low" | "medium" | "high"; dueAt: Date; completed: boolean };
export function suggestOrder(tasks: SchedulerInput[]): SchedulerInput[] {
  const now = Date.now();
  const score = (t: SchedulerInput) => {
    const hoursUntilDue = Math.max(0, (t.dueAt.getTime() - now) / 3600000);
    const urgency = t.completed ? -100 : hoursUntilDue < 24 ? 3 : hoursUntilDue < 72 ? 2 : 1;
    const prio = t.priority === "high" ? 3 : t.priority === "medium" ? 2 : 1;
    return prio * 100 + urgency * 10 - t.durationMinutes / 60;
  };
  return [...tasks].sort((a, b) => score(b) - score(a));
}
export function estimateSessions(totalMinutes: number, sessionMinutes = 45): number {
  return Math.max(1, Math.ceil(totalMinutes / sessionMinutes));
}
