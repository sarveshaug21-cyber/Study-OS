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

// ── Phase 2/4 additions ──
export const questionTypeEnum = pgEnum("question_type", ["multiple_choice","short_answer","long_answer"]);
export const questionSourceEnum = pgEnum("question_source", ["official","generated","user_created"]);
export const aiRoleEnum = pgEnum("ai_role", ["user","assistant","system"]);
export const specUpdateStatusEnum = pgEnum("spec_update_status", ["confirmed","proposed","unverified"]);

export const examBoards = pgTable("exam_boards", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  officialUrl: text("official_url"),
  ...timestamps,
});

export const qualifications = pgTable("qualifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  level: qualificationLevelEnum("level").notNull(),
  officialUrl: text("official_url"),
  ...timestamps,
});

export const specifications = pgTable("specifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  boardId: uuid("board_id").references(() => examBoards.id, { onDelete: "cascade" }),
  qualificationId: uuid("qualification_id").references(() => qualifications.id, { onDelete: "cascade" }),
  board: examBoardEnum("board"),
  level: qualificationLevelEnum("level"),
  subjectName: text("subject_name").notNull(),
  subjectCode: text("subject_code"),
  title: text("title").notNull(),
  officialUrl: text("official_url"),
  verified: boolean("verified").notNull().default(false),
  version: text("version"),
  ...timestamps,
});

export const topics = pgTable("topics", {
  id: uuid("id").defaultRandom().primaryKey(),
  specificationId: uuid("specification_id").references(() => specifications.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  subjectId: uuid("subject_id").references(() => subjects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isOfficial: boolean("is_official").notNull().default(false),
  ...timestamps,
});

export const topicProgress = pgTable("topic_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  topicId: uuid("topic_id").notNull().references(() => topics.id, { onDelete: "cascade" }),
  completed: boolean("completed").notNull().default(false),
  mastery: integer("mastery").notNull().default(0),
  ...timestamps,
}, (t) => ({ uniq: uniqueIndex("topic_progress_user_topic_idx").on(t.userId, t.topicId) }));

export const bookmarks = pgTable("bookmarks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  noteId: uuid("note_id").references(() => notes.id, { onDelete: "cascade" }),
  topicId: uuid("topic_id").references(() => topics.id, { onDelete: "cascade" }),
  ...timestamps,
});

export const studySessions = pgTable("study_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subjectId: uuid("subject_id").references(() => subjects.id, { onDelete: "set null" }),
  topicId: uuid("topic_id").references(() => topics.id, { onDelete: "set null" }),
  minutes: integer("minutes").notNull(),
  focus: text("focus"),
  notes: text("notes"),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  ...timestamps,
});

export const flashcardReviews = pgTable("flashcard_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  flashcardId: uuid("flashcard_id").notNull().references(() => flashcards.id, { onDelete: "cascade" }),
  correct: boolean("correct").notNull(),
  intervalDays: integer("interval_days").notNull().default(1),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }).defaultNow().notNull(),
});

export const aiConversations = pgTable("ai_conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subjectId: uuid("subject_id").references(() => subjects.id, { onDelete: "set null" }),
  title: text("title"),
  provider: text("provider"),
  model: text("model"),
  ...timestamps,
});

export const aiMessages = pgTable("ai_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").notNull().references(() => aiConversations.id, { onDelete: "cascade" }),
  role: aiRoleEnum("role").notNull(),
  content: text("content").notNull(),
  generated: boolean("generated").notNull().default(true),
  ...timestamps,
});

export const userSettings = pgTable("user_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  theme: text("theme").notNull().default("light"),
  dailyGoalMinutes: integer("daily_goal_minutes").notNull().default(60),
  weekStartDay: text("week_start_day").notNull().default("Monday"),
  targetGrade: text("target_grade"),
  aiProvider: text("ai_provider"),
  aiModel: text("ai_model"),
  notificationsJson: text("notifications_json"),
  expand_specifications: boolean("expand_specifications").notNull().default(false),
  ...timestamps,
});

export const specUpdates = pgTable("spec_updates", {
  id: uuid("id").defaultRandom().primaryKey(),
  board: examBoardEnum("board").notNull(),
  level: qualificationLevelEnum("level"),
  subjectName: text("subject_name"),
  title: text("title").notNull(),
  sourceUrl: text("source_url").notNull(),
  status: specUpdateStatusEnum("status").notNull().default("unverified"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  checkedAt: timestamp("checked_at", { withTimezone: true }).defaultNow().notNull(),
  summary: text("summary"),
  ...timestamps,
});

export const pastPaperCompletions = pgTable("past_paper_completions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  pastPaperId: uuid("past_paper_id").notNull().references(() => pastPapers.id, { onDelete: "cascade" }),
  score: integer("score"),
  completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
  personalNotes: text("personal_notes"),
  ...timestamps,
});


// ── Prepared (not yet migrated): Google Drive metadata tables ──
// These support replacing the notificationsJson blob storage for Drive metadata.
// Apply via a reviewed migration before switching lib/google-drive-storage.ts to use them.
export const googleDriveConnections = pgTable("google_drive_connections", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  refreshTokenEncrypted: text("refresh_token_encrypted").notNull(),
  folderId: text("folder_id").notNull(),
  folderName: text("folder_name"),
  connectedAt: timestamp("connected_at", { withTimezone: true }).defaultNow().notNull(),
  email: text("email"),
  ...timestamps,
});

export const driveFiles = pgTable("drive_files", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  driveFileId: text("drive_file_id").notNull(),
  name: text("name").notNull(),
  mimeType: text("mimeType").notNull(),
  size: text("size"),
  parentId: text("parent_id").notNull(),
  board: examBoardEnum("board"),
  qualification: qualificationLevelEnum("qualification"),
  subject: text("subject"),
  specCode: text("spec_code"),
  resourceType: text("resource_type"),
  sourceUrl: text("source_url"),
  verified: boolean("verified").notNull().default(false),
  importedAt: timestamp("imported_at", { withTimezone: true }).defaultNow().notNull(),
  ...timestamps,
}, (table) => ({
  userDriveFileIdx: uniqueIndex("drive_files_user_drive_file_idx").on(table.userId, table.driveFileId),
}));
