import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const examBoardEnum = pgEnum("exam_board", [
  "AQA",
  "Pearson Edexcel",
  "OCR",
  "WJEC",
  "Eduqas",
  "CCEA",
]);

export const qualificationLevelEnum = pgEnum("qualification_level", [
  "GCSE",
  "International GCSE",
  "A-level",
  "International A-level",
]);

export const difficultyEnum = pgEnum("difficulty", [
  "easy",
  "medium",
  "hard",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "done",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    displayName: text("display_name").notNull(),
    avatarUrl: text("avatar_url"),
    examBoard: examBoardEnum("exam_board").default("AQA").notNull(),
    studyGoalMinutes: integer("study_goal_minutes").default(60).notNull(),
    ...timestamps,
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  }),
);

export const subjects = pgTable(
  "subjects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    code: text("code").notNull(),
    board: examBoardEnum("board").notNull(),
    level: qualificationLevelEnum("level").notNull(),
    accent: text("accent").notNull().default("#7A55F2"),
    targetGrade: text("target_grade"),
    predictedGrade: text("predicted_grade"),
    examDate: timestamp("exam_date", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    userIdx: index("subjects_user_id_idx").on(table.userId),
    boardIdx: index("subjects_board_idx").on(table.board),
    levelIdx: index("subjects_level_idx").on(table.level),
  }),
);

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    isPinned: boolean("is_pinned").notNull().default(false),
    ...timestamps,
  },
  (table) => ({
    userIdx: index("notes_user_id_idx").on(table.userId),
    subjectIdx: index("notes_subject_id_idx").on(table.subjectId),
    pinnedIdx: index("notes_is_pinned_idx").on(table.isPinned),
  }),
);

export const flashcardDecks = pgTable(
  "flashcard_decks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    ...timestamps,
  },
  (table) => ({
    userIdx: index("flashcard_decks_user_id_idx").on(table.userId),
    subjectIdx: index("flashcard_decks_subject_id_idx").on(table.subjectId),
  }),
);

export const flashcards = pgTable(
  "flashcards",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    deckId: uuid("deck_id")
      .notNull()
      .references(() => flashcardDecks.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    front: text("front").notNull(),
    back: text("back").notNull(),
    hint: text("hint"),
    mastery: integer("mastery").notNull().default(0),
    dueAt: timestamp("due_at", { withTimezone: true }).defaultNow().notNull(),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    deckIdx: index("flashcards_deck_id_idx").on(table.deckId),
    userIdx: index("flashcards_user_id_idx").on(table.userId),
    dueIdx: index("flashcards_due_at_idx").on(table.dueAt),
  }),
);

export const practiceQuestions = pgTable(
  "practice_questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    modelAnswer: text("model_answer").notNull(),
    markScheme: text("mark_scheme"),
    difficulty: difficultyEnum("difficulty").notNull().default("medium"),
    marks: integer("marks").notNull().default(1),
    ...timestamps,
  },
  (table) => ({
    userIdx: index("practice_questions_user_id_idx").on(table.userId),
    subjectIdx: index("practice_questions_subject_id_idx").on(table.subjectId),
    difficultyIdx: index("practice_questions_difficulty_idx").on(
      table.difficulty,
    ),
  }),
);

export const practiceAttempts = pgTable(
  "practice_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => practiceQuestions.id, { onDelete: "cascade" }),
    answer: text("answer"),
    score: integer("score"),
    marksAvailable: integer("marks_available").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdx: index("practice_attempts_user_id_idx").on(table.userId),
    questionIdx: index("practice_attempts_question_id_idx").on(
      table.questionId,
    ),
  }),
);

export const plannerTasks = pgTable(
  "planner_tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id").references(() => subjects.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    description: text("description"),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
    estimatedMinutes: integer("estimated_minutes").notNull().default(30),
    status: taskStatusEnum("status").notNull().default("todo"),
    priority: taskPriorityEnum("priority").notNull().default("medium"),
    ...timestamps,
  },
  (table) => ({
    userIdx: index("planner_tasks_user_id_idx").on(table.userId),
    scheduledIdx: index("planner_tasks_scheduled_for_idx").on(
      table.scheduledFor,
    ),
    statusIdx: index("planner_tasks_status_idx").on(table.status),
  }),
);

export const progressRecords = pgTable(
  "progress_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    mastery: integer("mastery").notNull().default(0),
    confidence: integer("confidence").notNull().default(0),
    studyMinutes: integer("study_minutes").notNull().default(0),
    recordedAt: timestamp("recorded_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdx: index("progress_records_user_id_idx").on(table.userId),
    subjectIdx: index("progress_records_subject_id_idx").on(table.subjectId),
    recordedIdx: index("progress_records_recorded_at_idx").on(
      table.recordedAt,
    ),
  }),
);

export const pastPapers = pgTable(
  "past_papers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    board: examBoardEnum("board").notNull(),
    level: qualificationLevelEnum("level").notNull(),
    year: integer("year").notNull(),
    session: text("session").notNull(),
    paperCode: text("paper_code").notNull(),
    title: text("title").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    marks: integer("marks").notNull(),
    hasMarkScheme: boolean("has_mark_scheme").notNull().default(true),
    ...timestamps,
  },
  (table) => ({
    subjectIdx: index("past_papers_subject_id_idx").on(table.subjectId),
    boardIdx: index("past_papers_board_idx").on(table.board),
    levelIdx: index("past_papers_level_idx").on(table.level),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  subjects: many(subjects),
  notes: many(notes),
  decks: many(flashcardDecks),
  practiceQuestions: many(practiceQuestions),
  plannerTasks: many(plannerTasks),
  progressRecords: many(progressRecords),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  user: one(users, {
    fields: [subjects.userId],
    references: [users.id],
  }),
  notes: many(notes),
  decks: many(flashcardDecks),
  practiceQuestions: many(practiceQuestions),
  plannerTasks: many(plannerTasks),
  progressRecords: many(progressRecords),
  pastPapers: many(pastPapers),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
  subject: one(subjects, {
    fields: [notes.subjectId],
    references: [subjects.id],
  }),
}));

export const flashcardDecksRelations = relations(
  flashcardDecks,
  ({ one, many }) => ({
    user: one(users, {
      fields: [flashcardDecks.userId],
      references: [users.id],
    }),
    subject: one(subjects, {
      fields: [flashcardDecks.subjectId],
      references: [subjects.id],
    }),
    cards: many(flashcards),
  }),
);

export const flashcardsRelations = relations(flashcards, ({ one }) => ({
  deck: one(flashcardDecks, {
    fields: [flashcards.deckId],
    references: [flashcardDecks.id],
  }),
  user: one(users, {
    fields: [flashcards.userId],
    references: [users.id],
  }),
}));

export const practiceQuestionsRelations = relations(
  practiceQuestions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [practiceQuestions.userId],
      references: [users.id],
    }),
    subject: one(subjects, {
      fields: [practiceQuestions.subjectId],
      references: [subjects.id],
    }),
    attempts: many(practiceAttempts),
  }),
);

export const practiceAttemptsRelations = relations(
  practiceAttempts,
  ({ one }) => ({
    user: one(users, {
      fields: [practiceAttempts.userId],
      references: [users.id],
    }),
    question: one(practiceQuestions, {
      fields: [practiceAttempts.questionId],
      references: [practiceQuestions.id],
    }),
  }),
);

export const plannerTasksRelations = relations(plannerTasks, ({ one }) => ({
  user: one(users, {
    fields: [plannerTasks.userId],
    references: [users.id],
  }),
  subject: one(subjects, {
    fields: [plannerTasks.subjectId],
    references: [subjects.id],
  }),
}));

export const progressRecordsRelations = relations(
  progressRecords,
  ({ one }) => ({
    user: one(users, {
      fields: [progressRecords.userId],
      references: [users.id],
    }),
    subject: one(subjects, {
      fields: [progressRecords.subjectId],
      references: [subjects.id],
    }),
  }),
);

export const pastPapersRelations = relations(pastPapers, ({ one }) => ({
  subject: one(subjects, {
    fields: [pastPapers.subjectId],
    references: [subjects.id],
  }),
}));
