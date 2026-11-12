"use client";

import {
  ArrowUp,
  Bot,
  RotateCcw,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hi! I'm your Study OS tutor. I can explain concepts, help you plan exam answers, or quiz you on topics. What would you like to work on today?",
  },
];

type Subject = {
  id: string;
  name: string;
  board: string;
  level: string;
};

type Topic = {
  id: string;
  name: string;
  description?: string | null;
};

export function AiTutorChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [contextInfo, setContextInfo] = useState<{ yearGroup?: string; examBoard?: string; qualification?: string } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const nextId = useRef(4);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, thinking]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    loadSubjects();
    loadContext();
  }, []);

  async function loadSubjects() {
    try {
      const d = await api<{ subjects: { id: string; name: string; board: string; level: string }[] }>("/api/subjects");
      setSubjects(d.subjects ?? []);
    } catch {
      // Supabase not configured or no subjects yet
    }
  }

  async function loadContext() {
    try {
      const d = await api<{ studentProfile: { yearGroup?: string | null; examBoard?: string | null; qualification?: string | null } | null }>("/api/settings");
      const sp = d.studentProfile;
      if (sp) {
        setContextInfo({
          yearGroup: sp.yearGroup ?? undefined,
          examBoard: sp.examBoard ?? undefined,
          qualification: sp.qualification ?? undefined,
        });
      }
    } catch {
      // Settings not available yet; header falls back to the placeholder.
    }
  }

  async function loadTopics(subjectId: string) {
    try {
      const d = await api<{ topics: { id: string; name: string; description?: string | null }[] }>(`/api/topics?subjectId=${encodeURIComponent(subjectId)}`);
      setTopics(d.topics ?? []);
    } catch {
      setTopics([]);
    }
  }

  const send = async (value: string) => {
    const content = value.trim();
    if (!content || thinking) return;

    const userMessage: Message = {
      id: nextId.current++,
      role: "user",
      content,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setThinking(true);

    const doReply = async () => {
      try {
        setAiError(null);
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: content,
            subjectId: selectedSubjectId,
            topicId: selectedTopicId,
          }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? "AI unavailable");
        }
        const data = (await res.json()) as { reply?: string };
        if (!data.reply) throw new Error("No reply");
        return data.reply;
      } catch (e) {
        setAiError(e instanceof Error ? e.message : "AI unavailable");
        return createReply(content);
      }
    };

    timerRef.current = setTimeout(() => {
      void doReply().then((reply) => {
        setMessages((current) => [...current, { id: nextId.current++, role: "assistant", content: reply }]);
        setThinking(false);
      });
    }, 750);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    send(input);
  };

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setThinking(false);
    setMessages(initialMessages);
    setInput("");
  };

  return (
    <section
      className="card flex min-h-[36rem] flex-col overflow-hidden xl:h-[calc(100dvh-11rem)]"
      aria-labelledby="tutor-chat-title"
    >
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
        <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
          <Bot aria-hidden="true" size={19} />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="tutor-chat-title" className="text-sm font-semibold">
            Study OS Tutor
          </h2>
          <p className="text-xs text-ink-muted">
            {contextInfo ? `${contextInfo.yearGroup} · ${contextInfo.examBoard} · ${contextInfo.qualification}` : "Select subject & topic in settings"}
          </p>
        </div>
        <div className="flex-1">
          <div className="flex gap-2">
            <select
              value={selectedSubjectId ?? ""}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSelectedTopicId(null);
                if (e.target.value) loadTopics(e.target.value);
              }}
              className="input text-xs"
              disabled={thinking}
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.board} · {s.level})
                </option>
              ))}
            </select>
            <select
              value={selectedTopicId ?? ""}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="input text-xs"
              disabled={thinking || !selectedSubjectId}
            >
              <option value="">Select topic</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-ink-muted transition hover:bg-slate-100 hover:text-ink"
        >
          <RotateCcw aria-hidden="true" size={13} />
          Reset
        </button>
      </div>

      {aiError && (
        <p role="status" className="border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-xs text-amber-800">
          AI provider unavailable — showing demo replies. ({aiError})
        </p>
      )}

      <div
        className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 p-4 sm:p-5"
        role="log"
        aria-live="polite"
        aria-label="Conversation with Study OS Tutor"
      >
        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-2.5",
                isUser && "flex-row-reverse",
              )}
            >
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                  isUser
                    ? "bg-amber-100 text-amber-900"
                    : "bg-brand-100 text-brand-700",
                )}
                aria-hidden="true"
              >
                {isUser ? <UserRound size={15} /> : <Sparkles size={15} />}
              </span>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[75%]",
                  isUser
                    ? "rounded-tr-md bg-ink text-white"
                    : "rounded-tl-md border border-slate-200 bg-white text-ink-soft",
                )}
              >
                <p className="sr-only">
                  {isUser ? "You said:" : "Tutor said:"}
                </p>
                <p className="whitespace-pre-line">{message.content}</p>
              </div>
            </div>
          );
        })}
        {thinking && (
          <div className="flex items-start gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700">
              <Sparkles aria-hidden="true" size={15} />
            </span>
            <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3">
              <span className="sr-only">Tutor is thinking</span>
              <span className="flex gap-1" aria-hidden="true">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                    style={{ animationDelay: `${dot * 120}ms` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-slate-100 bg-white p-4">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => send(suggestion)}
              disabled={thinking}
              className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor="tutor-input" className="sr-only">
              Ask the AI tutor a question
            </label>
            <input
              id="tutor-input"
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={selectedTopicId ? "Ask about this topic…" : "Select a subject and topic first…"}
              className="input"
              autoComplete="off"
              disabled={thinking || !selectedSubjectId}
            />
          </div>
          <button
            type="submit"
            disabled={thinking || input.trim() === "" || !selectedSubjectId}
            className="btn-primary h-[42px] px-3 sm:px-4"
            aria-label="Send message"
          >
            <ArrowUp aria-hidden="true" size={17} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
        <p className="mt-2 text-[0.68rem] text-ink-muted">
          Demo only · simulated tutor responses · check important answers against your specification.
        </p>
      </div>
    </section>
  );
}

const suggestions = [
  "Explain this concept step by step",
  "Quiz me on this topic",
  "Create practice questions",
  "Explain my incorrect answer",
  "Create flashcards from this topic",
];

function createReply(input: string): string {
  const normalized = input.toLowerCase();

  if (normalized.includes("fick") || normalized.includes("exchange")) {
    return "Fick's law describes the rate of diffusion:\n\nrate ∝ (surface area × concentration difference) ÷ diffusion distance\n\nA useful exam example is the alveolus. Many alveoli create a large surface area, the squamous epithelium creates a short diffusion distance, and ventilation plus blood flow maintain a steep concentration gradient.\n\nTry to link each adaptation to one variable in the equation rather than listing features.";
  }

  if (normalized.includes("integration") || normalized.includes("maths")) {
    return "For integration by parts, start with ∫u dv = uv − ∫v du.\n\nUse LIATE to choose u: logarithms, inverse trig, algebraic, trig, exponential. For ∫x e^(2x) dx, choose u = x and dv = e^(2x) dx.\n\nThat gives ½x e^(2x) − ∫½e^(2x) dx, so the final answer is ½x e^(2x) − ¼e^(2x) + C. Check the sign carefully.";
  }

  if (normalized.includes("memory") || normalized.includes("psych")) {
    return "Compare the models by function, not just structure.\n\nThe multi-store model uses separate sensory, short-term and long-term stores linked by attention and rehearsal. The working memory model replaces short-term memory with an active central executive and two slave systems.\n\nFor evaluation, use dual-task evidence to support separate components, then criticise the under-specified central executive. Finish with a judgement about explanatory power.";
  }

  if (normalized.includes("macbeth") || normalized.includes("ambition")) {
    return "A strong Macbeth paragraph can follow this shape:\n\n1. Claim: Shakespeare presents ambition as a corrupting force.\n2. Evidence: embed 'vaulting ambition, which o'erleaps itself'.\n3. Analysis: 'vaulting' suggests energy and excess; 'o'erleaps' implies a fatal loss of control.\n4. Context: link to Jacobean anxieties about kingship and the tragic form.\n5. Evaluation: track how ambition moves from possibility to compulsion across the play.\n\nUse two or three quotations in depth rather than many quotations without analysis.";
  }

  if (normalized.includes("quiz")) {
    return "Let's try a quick retrieval drill:\n\n1. What does the 'central executive' do in the working memory model?\n2. Give two ways alveoli are adapted for gas exchange.\n3. What is the first step when choosing u and dv for integration by parts?\n\nAnswer in your own words and I will check your reasoning.";
  }

  return "Here is how I would approach that:\n\nFirst, identify the command word and the number of marks. Then recall the core process or model, and choose one concrete example. Finally, connect the example back to the question in a single closing sentence.\n\nIn this demo I am working from a small set of canned responses. Try one of the suggested prompts for a more detailed explanation.";
}
