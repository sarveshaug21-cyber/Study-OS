"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Check, Database, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import {
  EXAM_BOARDS,
  QUALIFICATION_LEVELS,
  type ExamBoard,
  type QualificationLevel,
} from "@/lib/demo-data";
import { Badge } from "@/components/ui";
import { api } from "@/lib/api";
import { isDemoMode } from "@/lib/env";

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="mt-0.5 block text-xs leading-5 text-ink-muted">
          {description}
        </span>
      </span>
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="absolute inset-0 rounded-full bg-slate-200 transition peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2" />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="card p-5 sm:p-6" aria-labelledby={`${title.replace(/\s+/g, "-").toLowerCase()}-title`}>
      <h2
        id={`${title.replace(/\s+/g, "-").toLowerCase()}-title`}
        className="text-base font-semibold tracking-tight"
      >
        {title}
      </h2>
      <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function SettingsForm() {
  const [profile, setProfile] = useState({
    displayName: "Amara Okafor",
    email: "amara.okafor@example.com",
    school: "Northbridge Sixth Form",
    yearGroup: "Year 13",
  });
  const [preferences, setPreferences] = useState<{
    board: ExamBoard;
    level: QualificationLevel;
    goal: string;
    weekStart: string;
    targetGrade: string;
    yearGroup: string;
  }>({
    board: "AQA",
    level: "A-level",
    goal: "90",
    weekStart: "Monday",
    targetGrade: "A*",
    yearGroup: "Year 13",
  });
  const [notifications, setNotifications] = useState({
    daily: true,
    digest: true,
    assessments: true,
    flashcards: false,
  });
  const [reduceMotion, setReduceMotion] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
    return () => document.documentElement.classList.remove("reduce-motion");
  }, [reduceMotion]);

  const notify = (message: string) => {
    setStatus(message);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus(null), 4000);
  };

  useEffect(() => {
    if (isDemoMode()) return;
    api<{ studentProfile?: { yearGroup?: string | null; qualification?: string | null; examBoard?: string } | null }>("/api/settings")
      .then((d) => {
        if (d.studentProfile?.yearGroup) setPreferences((p) => ({ ...p, yearGroup: d.studentProfile!.yearGroup! }));
        if (d.studentProfile?.qualification) setPreferences((p) => ({ ...p, level: d.studentProfile!.qualification as QualificationLevel }));
        if (d.studentProfile?.examBoard) setPreferences((p) => ({ ...p, board: d.studentProfile!.examBoard as ExamBoard }));
      })
      .catch(() => {});
  }, []);

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    notify("Profile changes saved locally for this demo.");
  };

  const savePreferences = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    notify("Study preferences saved locally for this demo.");
    if (!isDemoMode()) {
      api("/api/settings", { method: "PUT", body: JSON.stringify({ yearGroup: preferences.yearGroup, qualification: preferences.level, examBoard: preferences.board, dailyGoalMinutes: Number(preferences.goal) }) }).catch(() => notify("Could not sync to server."));
    }
  };

  const resetPreferences = () => {
    setProfile({
      displayName: "Amara Okafor",
      email: "amara.okafor@example.com",
      school: "Northbridge Sixth Form",
      yearGroup: "Year 13",
    });
    setPreferences({
      board: "AQA",
      level: "A-level",
      goal: "90",
      weekStart: "Monday",
      targetGrade: "A*",
      yearGroup: "Year 13",
    });
    setNotifications({
      daily: true,
      digest: true,
      assessments: true,
      flashcards: false,
    });
    setReduceMotion(false);
    notify("Demo preferences reset to their original values.");
  };

  return (
    <div className="space-y-5">
      {status && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
        >
          <Check aria-hidden="true" size={16} />
          {status}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr] xl:items-start">
        <div className="space-y-5">
          <SettingsCard
            title="Profile"
            description="Your display name and school details."
          >
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="display-name" className="label">
                    Full name
                  </label>
                  <input
                    id="display-name"
                    type="text"
                    value={profile.displayName}
                    onChange={(event) =>
                      setProfile((current) => ({
                        ...current,
                        displayName: event.target.value,
                      }))
                    }
                    className="input"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="profile-email" className="label">
                    Email
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={profile.email}
                    onChange={(event) =>
                      setProfile((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    className="input"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="profile-school" className="label">
                    School or college
                  </label>
                  <input
                    id="profile-school"
                    type="text"
                    value={profile.school}
                    onChange={(event) =>
                      setProfile((current) => ({
                        ...current,
                        school: event.target.value,
                      }))
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="profile-year" className="label">
                    Year group
                  </label>
                  <select
                    id="profile-year"
                    value={profile.yearGroup}
                    onChange={(event) =>
                      setProfile((current) => ({
                        ...current,
                        yearGroup: event.target.value,
                      }))
                    }
                    className="input"
                  >
                    {["Year 10", "Year 11", "Year 12", "Year 13"].map(
                      (year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary">
                  Save profile
                </button>
              </div>
            </form>
          </SettingsCard>

          <SettingsCard
            title="Study preferences"
            description="Defaults for planning and exam preparation."
          >
            <form onSubmit={savePreferences} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="default-board" className="label">
                    Default exam board
                  </label>
                  <select
                    id="default-board"
                    value={preferences.board}
                    onChange={(event) =>
                      setPreferences((current) => ({
                        ...current,
                        board: event.target.value as ExamBoard,
                      }))
                    }
                    className="input"
                  >
                    {EXAM_BOARDS.map((board) => (
                      <option key={board} value={board}>
                        {board}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="default-level" className="label">
                    Default qualification
                  </label>
                  <select
                    id="default-level"
                    value={preferences.level}
                    onChange={(event) =>
                      setPreferences((current) => ({
                        ...current,
                        level: event.target.value as QualificationLevel,
                      }))
                    }
                    className="input"
                  >
                    {QUALIFICATION_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="daily-goal" className="label">
                    Daily study goal
                  </label>
                  <select
                    id="daily-goal"
                    value={preferences.goal}
                    onChange={(event) =>
                      setPreferences((current) => ({
                        ...current,
                        goal: event.target.value,
                      }))
                    }
                    className="input"
                  >
                    {["30", "45", "60", "90", "120", "150"].map((minutes) => (
                      <option key={minutes} value={minutes}>
                        {minutes} minutes
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="year-group" className="label">
                    Year group
                  </label>
                  <select
                    id="year-group"
                    value={preferences.yearGroup}
                    onChange={(event) =>
                      setPreferences((current) => ({
                        ...current,
                        yearGroup: event.target.value,
                      }))
                    }
                    className="input"
                  >
                    {["Year 10", "Year 11", "Year 12", "Year 13"].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="week-start" className="label">
                    Week starts on
                  </label>
                  <select
                    id="week-start"
                    value={preferences.weekStart}
                    onChange={(event) =>
                      setPreferences((current) => ({
                        ...current,
                        weekStart: event.target.value,
                      }))
                    }
                    className="input"
                  >
                    {["Monday", "Sunday"].map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="target-grade" className="label">
                  Overall target grade
                </label>
                <select
                  id="target-grade"
                  value={preferences.targetGrade}
                  onChange={(event) =>
                    setPreferences((current) => ({
                      ...current,
                      targetGrade: event.target.value,
                    }))
                  }
                  className="input sm:max-w-[12rem]"
                >
                  {["A*", "A", "B", "9", "8", "7"].map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary">
                  Save preferences
                </button>
              </div>
            </form>
          </SettingsCard>
        </div>

        <div className="space-y-5">
          <SettingsCard
            title="Notifications"
            description="Choose which reminders appear in your workspace."
          >
            <div className="divide-y divide-slate-100">
              <Toggle
                label="Daily study reminder"
                description="A gentle nudge at 17:30 on school days."
                checked={notifications.daily}
                onChange={(checked) =>
                  setNotifications((current) => ({ ...current, daily: checked }))
                }
              />
              <Toggle
                label="Weekly progress digest"
                description="A Sunday summary of mastery and study time."
                checked={notifications.digest}
                onChange={(checked) =>
                  setNotifications((current) => ({ ...current, digest: checked }))
                }
              />
              <Toggle
                label="Assessment reminders"
                description="Alerts at 7 and 2 days before an assessment."
                checked={notifications.assessments}
                onChange={(checked) =>
                  setNotifications((current) => ({
                    ...current,
                    assessments: checked,
                  }))
                }
              />
              <Toggle
                label="Flashcard due alerts"
                description="Notify me when more than 20 cards are due."
                checked={notifications.flashcards}
                onChange={(checked) =>
                  setNotifications((current) => ({
                    ...current,
                    flashcards: checked,
                  }))
                }
              />
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => notify("Notification preferences saved locally.")}
                className="btn-secondary px-3 py-2 text-xs"
              >
                Save notifications
              </button>
              <span className="text-[0.68rem] text-ink-muted">Demo only</span>
            </div>
          </SettingsCard>

          <SettingsCard
            title="Accessibility"
            description="Adjust how the interface feels."
          >
            <Toggle
              label="Reduce motion"
              description="Prefer fewer transitions and animations."
              checked={reduceMotion}
              onChange={(checked) => {
                setReduceMotion(checked);
                notify("Motion preference updated for this session.");
              }}
            />
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs leading-5 text-ink-muted">
              The demo respects your operating system&apos;s reduced-motion
              setting automatically. This switch is an additional local
              preference.
            </div>
          </SettingsCard>

          <section className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5" aria-labelledby="privacy-title">
            <div className="flex items-center gap-2">
              <ShieldCheck aria-hidden="true" size={17} className="text-brand-700" />
              <h2 id="privacy-title" className="text-sm font-semibold text-brand-900">
                Data & privacy
              </h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-brand-900/80">
              This temporary workspace contains no user data. Everything you see
              is static demo content and any changes remain in your browser for
              this session only.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge className="border-brand-200 bg-white text-brand-800">
                No analytics
              </Badge>
              <Badge className="border-brand-200 bg-white text-brand-800">
                No stored prompts
              </Badge>
              <Badge className="border-brand-200 bg-white text-brand-800">
                Supabase-ready
              </Badge>
            </div>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="database-title">
            <div className="flex items-center gap-2">
              <Database aria-hidden="true" size={17} className="text-ink-muted" />
              <h2 id="database-title" className="text-sm font-semibold">
                Database connection
              </h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              The Drizzle schema and PostgreSQL client are ready for Supabase.
              Add the placeholder variables from{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
                .env.example
              </code>{" "}
              to persist real data.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-ink-soft">
              <Sparkles aria-hidden="true" size={13} className="text-brand-500" />
              Not connected · demo mode
            </div>
            <button
              type="button"
              onClick={resetPreferences}
              className="btn-secondary mt-4 w-full px-3 py-2 text-xs"
            >
              <RotateCcw aria-hidden="true" size={13} />
              Reset demo preferences
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
