export const EXAM_BOARDS = [
  "AQA",
  "Pearson Edexcel",
  "OCR",
  "WJEC",
  "Eduqas",
  "CCEA",
] as const;

export const QUALIFICATION_LEVELS = [
  "GCSE",
  "International GCSE",
  "A-level",
  "International A-level",
] as const;

export type ExamBoard = (typeof EXAM_BOARDS)[number];
export type QualificationLevel = (typeof QUALIFICATION_LEVELS)[number];
export type Difficulty = "easy" | "medium" | "hard";
export type Priority = "low" | "medium" | "high";

export type DemoUser = {
  name: string;
  initials: string;
  email: string;
  yearGroup: string;
  school: string;
  studyGoalMinutes: number;
};

export type Subject = {
  id: string;
  name: string;
  code: string;
  board: ExamBoard;
  level: QualificationLevel;
  accent: string;
  progress: number;
  targetGrade: string;
  predictedGrade: string;
  topicsComplete: number;
  topicsTotal: number;
  notesCount: number;
  cardsDue: number;
  nextSession: string;
  nextTopic: string;
  examDate: string;
  examDateIso: string;
  teacher: string;
};

export type NoteSection = {
  heading: string;
  body: string;
  bullets?: string[];
};

export type Note = {
  id: string;
  title: string;
  subjectId: string;
  subject: string;
  board: ExamBoard;
  level: QualificationLevel;
  accent: string;
  updated: string;
  readingMinutes: number;
  tags: string[];
  pinned: boolean;
  excerpt: string;
  sections: NoteSection[];
  keyTerms: { term: string; definition: string }[];
};

export type FlashcardDeck = {
  id: string;
  subjectId: string;
  subject: string;
  board: ExamBoard;
  level: QualificationLevel;
  title: string;
  accent: string;
  cards: number;
  due: number;
  mastered: number;
  lastStudied: string;
};

export type Flashcard = {
  id: string;
  deckId: string;
  front: string;
  back: string;
  hint: string;
};

export type PracticeQuestion = {
  id: string;
  subjectId: string;
  subject: string;
  board: ExamBoard;
  level: QualificationLevel;
  accent: string;
  question: string;
  modelAnswer: string;
  markScheme: string[];
  difficulty: Difficulty;
  marks: number;
  topic: string;
};

export type PastPaper = {
  id: string;
  subjectId: string;
  subject: string;
  board: ExamBoard;
  level: QualificationLevel;
  year: number;
  session: string;
  paperCode: string;
  title: string;
  durationMinutes: number;
  marks: number;
  hasMarkScheme: boolean;
};

export type PlannerTask = {
  id: string;
  day: string;
  date: string;
  time: string;
  title: string;
  subject: string;
  board: ExamBoard;
  level: QualificationLevel;
  accent: string;
  duration: number;
  priority: Priority;
  completed: boolean;
  type: "review" | "practice" | "notes" | "paper";
};

export type WeeklyStudyPoint = {
  day: string;
  minutes: number;
};

export type Assessment = {
  id: string;
  title: string;
  subject: string;
  board: ExamBoard;
  level: QualificationLevel;
  date: string;
  daysAway: number;
  accent: string;
  type: string;
};

export const demoUser: DemoUser = {
  name: "Amara Okafor",
  initials: "AO",
  email: "amara.okafor@example.com",
  yearGroup: "Year 13",
  school: "Northbridge Sixth Form",
  studyGoalMinutes: 90,
};

export const subjects: Subject[] = [
  {
    id: "bio-aqa",
    name: "Biology",
    code: "7402",
    board: "AQA",
    level: "A-level",
    accent: "#7A55F2",
    progress: 78,
    targetGrade: "A*",
    predictedGrade: "A",
    topicsComplete: 18,
    topicsTotal: 24,
    notesCount: 14,
    cardsDue: 8,
    nextSession: "Today · 17:30",
    nextTopic: "Exchange & transport",
    examDate: "08 Jun 2027",
    examDateIso: "2027-06-08",
    teacher: "Dr Ellis",
  },
  {
    id: "maths-edexcel",
    name: "Mathematics",
    code: "9MA0",
    board: "Pearson Edexcel",
    level: "A-level",
    accent: "#2563EB",
    progress: 64,
    targetGrade: "A",
    predictedGrade: "A",
    topicsComplete: 15,
    topicsTotal: 22,
    notesCount: 11,
    cardsDue: 5,
    nextSession: "Tue · 16:00",
    nextTopic: "Integration by parts",
    examDate: "11 Jun 2027",
    examDateIso: "2027-06-11",
    teacher: "Mr Shah",
  },
  {
    id: "chem-ocr",
    name: "Chemistry",
    code: "H432",
    board: "OCR",
    level: "A-level",
    accent: "#059669",
    progress: 52,
    targetGrade: "A",
    predictedGrade: "B",
    topicsComplete: 12,
    topicsTotal: 21,
    notesCount: 9,
    cardsDue: 6,
    nextSession: "Mon · 18:00",
    nextTopic: "Organic mechanisms",
    examDate: "15 Jun 2027",
    examDateIso: "2027-06-15",
    teacher: "Ms Iqbal",
  },
  {
    id: "englit-wjec",
    name: "English Literature",
    code: "C720",
    board: "WJEC",
    level: "GCSE",
    accent: "#DB2777",
    progress: 71,
    targetGrade: "9",
    predictedGrade: "8",
    topicsComplete: 16,
    topicsTotal: 20,
    notesCount: 8,
    cardsDue: 3,
    nextSession: "Wed · 17:00",
    nextTopic: "Macbeth: ambition & guilt",
    examDate: "18 May 2027",
    examDateIso: "2027-05-18",
    teacher: "Mrs Bevan",
  },
  {
    id: "geo-eduqas",
    name: "Geography",
    code: "C111",
    board: "Eduqas",
    level: "GCSE",
    accent: "#D97706",
    progress: 59,
    targetGrade: "8",
    predictedGrade: "7",
    topicsComplete: 11,
    topicsTotal: 18,
    notesCount: 6,
    cardsDue: 2,
    nextSession: "Thu · 16:30",
    nextTopic: "Coastal landforms",
    examDate: "26 May 2027",
    examDateIso: "2027-05-26",
    teacher: "Mr Llewellyn",
  },
  {
    id: "history-ccea",
    name: "History",
    code: "H201",
    board: "CCEA",
    level: "A-level",
    accent: "#B45309",
    progress: 46,
    targetGrade: "A",
    predictedGrade: "B",
    topicsComplete: 9,
    topicsTotal: 16,
    notesCount: 7,
    cardsDue: 4,
    nextSession: "Fri · 15:30",
    nextTopic: "The Cold War: détente",
    examDate: "03 Jun 2027",
    examDateIso: "2027-06-03",
    teacher: "Mr Mallon",
  },
  {
    id: "physics-int-edexcel",
    name: "Physics",
    code: "4PH1",
    board: "Pearson Edexcel",
    level: "International GCSE",
    accent: "#0891B2",
    progress: 83,
    targetGrade: "9",
    predictedGrade: "9",
    topicsComplete: 19,
    topicsTotal: 22,
    notesCount: 10,
    cardsDue: 0,
    nextSession: "Tomorrow · 10:00",
    nextTopic: "Electromagnetic induction",
    examDate: "20 May 2027",
    examDateIso: "2027-05-20",
    teacher: "Dr Osei",
  },
  {
    id: "psych-int-edexcel",
    name: "Psychology",
    code: "WPS01",
    board: "Pearson Edexcel",
    level: "International A-level",
    accent: "#9333EA",
    progress: 74,
    targetGrade: "A*",
    predictedGrade: "A",
    topicsComplete: 14,
    topicsTotal: 20,
    notesCount: 12,
    cardsDue: 4,
    nextSession: "Tue · 13:00",
    nextTopic: "Memory models",
    examDate: "09 Jun 2027",
    examDateIso: "2027-06-09",
    teacher: "Ms Hart",
  },
  {
    id: "cs-ocr",
    name: "Computer Science",
    code: "J277",
    board: "OCR",
    level: "GCSE",
    accent: "#475569",
    progress: 66,
    targetGrade: "8",
    predictedGrade: "7",
    topicsComplete: 13,
    topicsTotal: 19,
    notesCount: 5,
    cardsDue: 2,
    nextSession: "Wed · 14:00",
    nextTopic: "Database normalisation",
    examDate: "22 May 2027",
    examDateIso: "2027-05-22",
    teacher: "Mr Adeyemi",
  },
  {
    id: "business-int-edexcel",
    name: "Business",
    code: "YBS11",
    board: "Pearson Edexcel",
    level: "International A-level",
    accent: "#DC2626",
    progress: 61,
    targetGrade: "A",
    predictedGrade: "B",
    topicsComplete: 10,
    topicsTotal: 18,
    notesCount: 9,
    cardsDue: 3,
    nextSession: "Thu · 11:00",
    nextTopic: "Cash flow forecasting",
    examDate: "04 Jun 2027",
    examDateIso: "2027-06-04",
    teacher: "Mrs Cole",
  },
];

export const notes: Note[] = [
  {
    id: "note-exchange",
    title: "Exchange surfaces & transport",
    subjectId: "bio-aqa",
    subject: "Biology",
    board: "AQA",
    level: "A-level",
    accent: "#7A55F2",
    updated: "2 hours ago",
    readingMinutes: 6,
    tags: ["Exchange", "Fick's law", "Lungs"],
    pinned: true,
    excerpt:
      "Surface area, gradients and ventilation: the three levers that make gas exchange efficient.",
    sections: [
      {
        heading: "Fick's law",
        body: "The rate of diffusion through a surface is proportional to surface area × concentration difference, and inversely proportional to diffusion distance. Exam answers should connect each variable to a concrete adaptation rather than simply naming it.",
        bullets: [
          "Large surface area: folded membranes and alveoli increase the area available for diffusion.",
          "Steep gradient: ventilation refreshes air while blood flow removes oxygen and delivers carbon dioxide.",
          "Short distance: squamous epithelium and a thin capillary wall reduce the diffusion pathway.",
        ],
      },
      {
        heading: "Mammalian lungs",
        body: "Alveoli are grouped into sacs supplied by a dense capillary network. Ventilation and perfusion are matched during exercise, which maintains a concentration gradient even as demand rises.",
        bullets: [
          "Inspiration: diaphragm contracts and flattens; external intercostals raise the ribcage.",
          "Expiration at rest is passive, driven by elastic recoil.",
          "Tidal volume × breathing rate gives pulmonary ventilation.",
        ],
      },
      {
        heading: "Common exam traps",
        body: "Avoid saying that alveoli 'create' oxygen or that diffusion is 'active'. Diffusion is passive. Also make the distinction between a large surface area and a large volume; only the former increases the rate.",
      },
    ],
    keyTerms: [
      {
        term: "Concentration gradient",
        definition:
          "The difference in concentration between two regions; a steeper gradient increases diffusion rate.",
      },
      {
        term: "Ventilation",
        definition:
          "The movement of air into and out of the lungs, maintaining a concentration gradient.",
      },
      {
        term: "Squamous epithelium",
        definition:
          "A single layer of flattened cells that creates a short diffusion pathway.",
      },
    ],
  },
  {
    id: "note-integration",
    title: "Integration by parts",
    subjectId: "maths-edexcel",
    subject: "Mathematics",
    board: "Pearson Edexcel",
    level: "A-level",
    accent: "#2563EB",
    updated: "Yesterday",
    readingMinutes: 5,
    tags: ["Calculus", "Integration", "Formula book"],
    pinned: true,
    excerpt:
      "Choose u and dv deliberately, then check the sign before simplifying the final expression.",
    sections: [
      {
        heading: "The formula",
        body: "Integration by parts reverses the product rule. For definite integrals, evaluate the boundary term using the limits and keep the sign consistent throughout.",
        bullets: [
          "∫u dv = uv − ∫v du",
          "Choose u using the order: logs, inverse trig, algebraic, trig, exponential (LIATE).",
          "If the new integral is no simpler, swap your choice of u and dv.",
        ],
      },
      {
        heading: "Worked example",
        body: "For ∫x e^(2x) dx, take u = x and dv = e^(2x) dx. Then du = dx and v = ½e^(2x). The result is ½x e^(2x) − ¼e^(2x) + C.",
        bullets: [
          "Differentiate u: it should become simpler.",
          "Integrate dv: the exponential remains manageable.",
          "Repeat integration by parts when a polynomial has a higher degree.",
        ],
      },
    ],
    keyTerms: [
      {
        term: "LIATE",
        definition:
          "A heuristic for choosing u: logarithms, inverse trig, algebraic, trig, exponential.",
      },
      {
        term: "Definite integral",
        definition:
          "An integral evaluated between two limits, representing a signed area.",
      },
    ],
  },
  {
    id: "note-memory",
    title: "Memory models",
    subjectId: "psych-int-edexcel",
    subject: "Psychology",
    board: "Pearson Edexcel",
    level: "International A-level",
    accent: "#9333EA",
    updated: "Yesterday",
    readingMinutes: 8,
    tags: ["Memory", "Models", "Evaluation"],
    pinned: false,
    excerpt:
      "Compare the multi-store model with Baddeley and Hitch's working memory model using evidence, not just description.",
    sections: [
      {
        heading: "Multi-store model",
        body: "Atkinson and Shiffrin (1968) proposed sensory register, short-term memory and long-term memory as distinct stores connected by attention and rehearsal. The model is linear and stresses structural features.",
        bullets: [
          "Capacity: STM is limited to roughly 7 ± 2 chunks.",
          "Duration: STM is around 18–30 seconds without rehearsal.",
          "Evidence: primacy and recency effects, plus case studies such as Clive Wearing.",
        ],
      },
      {
        heading: "Working memory model",
        body: "Baddeley and Hitch (1974) replaced a single STM store with a central executive controlling the phonological loop, visuospatial sketchpad and episodic buffer.",
        bullets: [
          "Dual-task studies support separate phonological and visuospatial systems.",
          "The central executive is under-specified, which weakens the model.",
          "The episodic buffer explains how information from different modalities is integrated.",
        ],
      },
      {
        heading: "Exam strategy",
        body: "For a 12-mark evaluation, make a claim, use supporting evidence, then evaluate that evidence. Link each paragraph back to the question rather than writing two separate descriptions.",
      },
    ],
    keyTerms: [
      {
        term: "Central executive",
        definition:
          "The attentional control system in the working memory model that allocates resources.",
      },
      {
        term: "Episodic buffer",
        definition:
          "A limited-capacity store that integrates information from multiple sources.",
      },
      {
        term: "Dual-task technique",
        definition:
          "Completing two tasks simultaneously; interference patterns reveal separate components.",
      },
    ],
  },
  {
    id: "note-macbeth",
    title: "Macbeth: ambition & guilt",
    subjectId: "englit-wjec",
    subject: "English Literature",
    board: "WJEC",
    level: "GCSE",
    accent: "#DB2777",
    updated: "2 days ago",
    readingMinutes: 7,
    tags: ["Shakespeare", "Quotes", "Themes"],
    pinned: false,
    excerpt:
      "A quote bank and a flexible paragraph structure for ambition, guilt and the supernatural.",
    sections: [
      {
        heading: "Key quotations",
        body: "Use short, precise quotations and analyse individual words. Avoid retelling the plot; every quotation should support a claim about Shakespeare's choices.",
        bullets: [
          "\"Vaulting ambition, which o'erleaps itself\" — ambition as self-destructive.",
          "\"Out, damned spot!\" — guilt becomes physical and uncontrollable.",
          "\"Fair is foul, and foul is fair\" — moral inversion and equivocation.",
          "\"Stars, hide your fires\" — ambition concealed from moral scrutiny.",
        ],
      },
      {
        heading: "Paragraph structure",
        body: "State a clear argument, introduce context only where it sharpens your point, analyse language and structure, then evaluate the effect on a Jacobean audience.",
        bullets: [
          "Claim: Shakespeare presents ambition as a corrupting force.",
          "Evidence: a short quotation embedded in your sentence.",
          "Analysis: zoom in on a verb, image or structural contrast.",
          "Evaluation: link to the tragic form or contemporary beliefs.",
        ],
      },
    ],
    keyTerms: [
      {
        term: "Equivocation",
        definition:
          "Ambiguous language that conceals the truth; central to the witches' prophecies.",
      },
      {
        term: "Hamartia",
        definition:
          "The fatal flaw that contributes to a tragic hero's downfall.",
      },
    ],
  },
  {
    id: "note-coasts",
    title: "Coastal landforms",
    subjectId: "geo-eduqas",
    subject: "Geography",
    board: "Eduqas",
    level: "GCSE",
    accent: "#D97706",
    updated: "3 days ago",
    readingMinutes: 6,
    tags: ["Coasts", "Processes", "Case studies"],
    pinned: false,
    excerpt:
      "Link erosion, transportation and deposition to the landforms they create — and use named examples.",
    sections: [
      {
        heading: "Erosional landforms",
        body: "Headlands and bays form where resistant and less resistant rock meet the coast. Caves, arches, stacks and stumps form through hydraulic action, abrasion and attrition along a jointed headland.",
        bullets: [
          "Hydraulic action: air forced into cracks by waves.",
          "Abrasion: sediment scrapes the cliff face.",
          "Attrition: rocks collide and become smaller and rounder.",
        ],
      },
      {
        heading: "Depositional landforms",
        body: "Beaches, spits and bars form where the energy of the sea falls and sediment is deposited. Longshore drift moves material along the coast in a zig-zag pattern.",
        bullets: [
          "A spit forms where the coastline changes direction and a river mouth interrupts longshore drift.",
          "Salt marshes develop in the sheltered water behind a spit.",
          "Prevailing wind and swash angle control the direction of drift.",
        ],
      },
      {
        heading: "Case study reminder",
        body: "Use one named stretch of coastline for each landform. Explain the geology and process before describing the shape, otherwise the answer becomes a list.",
      },
    ],
    keyTerms: [
      {
        term: "Longshore drift",
        definition:
          "The movement of sediment along a coastline by angled swash and backwash.",
      },
      {
        term: "Discordant coast",
        definition:
          "A coastline where rock strata run perpendicular to the shore, producing headlands and bays.",
      },
    ],
  },
  {
    id: "note-detente",
    title: "The Cold War: détente",
    subjectId: "history-ccea",
    subject: "History",
    board: "CCEA",
    level: "A-level",
    accent: "#B45309",
    updated: "4 days ago",
    readingMinutes: 9,
    tags: ["Cold War", "Détente", "Interpretations"],
    pinned: false,
    excerpt:
      "Détente reduced friction but did not resolve the underlying ideological conflict.",
    sections: [
      {
        heading: "Why détente emerged",
        body: "Both superpowers faced domestic and international pressure by the late 1960s. Economic strain, the cost of the arms race, the Vietnam War and Sino-Soviet tensions made limited cooperation attractive.",
        bullets: [
          "1968: Nuclear Non-Proliferation Treaty signed.",
          "1969: SALT talks begin.",
          "1972: SALT I and the Anti-Ballistic Missile Treaty.",
          "1975: Helsinki Accords formalise détente in Europe.",
        ],
      },
      {
        heading: "Limits of détente",
        body: "Détente was selective. Regional conflicts continued through proxies, and human rights disputes limited trust. The Soviet invasion of Afghanistan in 1979 effectively ended the period.",
        bullets: [
          "1973: Yom Kippur War exposed superpower rivalry in the Middle East.",
          "1975: Helsinki's human rights basket created a later source of pressure on the USSR.",
          "1979: NATO's dual-track decision and the Afghanistan invasion renewed confrontation.",
        ],
      },
      {
        heading: "Interpreting the debate",
        body: "Some historians see détente as genuine crisis management; others argue it merely managed decline. The strongest answers distinguish between reducing the risk of nuclear war and resolving the Cold War itself.",
      },
    ],
    keyTerms: [
      {
        term: "Détente",
        definition:
          "A period of reduced tension between the superpowers through negotiation and arms control.",
      },
      {
        term: "SALT",
        definition:
          "Strategic Arms Limitation Talks, which produced limits on nuclear delivery systems.",
      },
      {
        term: "Helsinki Accords",
        definition:
          "1975 agreements on security, cooperation and human rights in Europe.",
      },
    ],
  },
  {
    id: "note-induction",
    title: "Electromagnetic induction",
    subjectId: "physics-int-edexcel",
    subject: "Physics",
    board: "Pearson Edexcel",
    level: "International GCSE",
    accent: "#0891B2",
    updated: "5 days ago",
    readingMinutes: 4,
    tags: ["Waves", "Electricity", "Required practical"],
    pinned: false,
    excerpt:
      "Faraday's law, Lenz's law and the factors that change an induced potential difference.",
    sections: [
      {
        heading: "Faraday's law",
        body: "A potential difference is induced when a conductor experiences a changing magnetic field. The size of the induced p.d. increases with the rate of change, the strength of the field and the number of turns.",
        bullets: [
          "Move a magnet faster through a coil to increase the induced p.d.",
          "Use a stronger magnet or more turns.",
          "Rotate a coil in a magnetic field to generate an alternating current.",
        ],
      },
      {
        heading: "Lenz's law",
        body: "The direction of the induced current opposes the change that caused it. This is a consequence of conservation of energy, not an arbitrary rule.",
        bullets: [
          "A falling magnet experiences a magnetic force opposing its motion.",
          "Generators convert kinetic energy to electrical energy.",
          "Transformers rely on mutual induction between coils.",
        ],
      },
    ],
    keyTerms: [
      {
        term: "Induced potential difference",
        definition:
          "A voltage created when a conductor cuts magnetic field lines or experiences a changing field.",
      },
      {
        term: "Lenz's law",
        definition:
          "The induced current acts to oppose the change producing it.",
      },
    ],
  },
  {
    id: "note-organic",
    title: "Organic mechanisms",
    subjectId: "chem-ocr",
    subject: "Chemistry",
    board: "OCR",
    level: "A-level",
    accent: "#059669",
    updated: "6 days ago",
    readingMinutes: 7,
    tags: ["Organic", "Mechanisms", "Curly arrows"],
    pinned: false,
    excerpt:
      "Curly arrows, electrophiles and nucleophiles: draw the movement of electron pairs precisely.",
    sections: [
      {
        heading: "Nucleophilic substitution",
        body: "A nucleophile donates an electron pair to an electron-deficient carbon, displacing a leaving group. Primary halogenoalkanes favour SN2; tertiary substrates favour SN1.",
        bullets: [
          "Draw the curly arrow from the nucleophile to the carbon.",
          "Draw the curly arrow from the C–X bond to the halogen.",
          "Show the transition state for SN2 and the carbocation for SN1.",
        ],
      },
      {
        heading: "Electrophilic addition",
        body: "Alkenes react with electrophiles such as HBr. The π bond breaks and a carbocation intermediate forms. Markovnikov's rule predicts the major product from carbocation stability.",
        bullets: [
          "Tertiary carbocations are more stable than primary carbocations.",
          "Inductive effects from alkyl groups stabilise the positive charge.",
          "Curly arrows must start from a bond or a lone pair, never from an atom.",
        ],
      },
    ],
    keyTerms: [
      {
        term: "Nucleophile",
        definition:
          "A species with a lone pair that attacks an electron-deficient centre.",
      },
      {
        term: "Carbocation",
        definition:
          "A positively charged carbon intermediate with an empty p orbital.",
      },
    ],
  },
];

export const flashcardDecks: FlashcardDeck[] = [
  {
    id: "deck-bio-exchange",
    subjectId: "bio-aqa",
    subject: "Biology",
    board: "AQA",
    level: "A-level",
    title: "Exchange surfaces",
    accent: "#7A55F2",
    cards: 48,
    due: 8,
    mastered: 76,
    lastStudied: "Today",
  },
  {
    id: "deck-maths-integration",
    subjectId: "maths-edexcel",
    subject: "Mathematics",
    board: "Pearson Edexcel",
    level: "A-level",
    title: "Integration techniques",
    accent: "#2563EB",
    cards: 36,
    due: 5,
    mastered: 64,
    lastStudied: "Yesterday",
  },
  {
    id: "deck-chem-organic",
    subjectId: "chem-ocr",
    subject: "Chemistry",
    board: "OCR",
    level: "A-level",
    title: "Organic mechanisms",
    accent: "#059669",
    cards: 54,
    due: 6,
    mastered: 58,
    lastStudied: "2 days ago",
  },
  {
    id: "deck-psych-memory",
    subjectId: "psych-int-edexcel",
    subject: "Psychology",
    board: "Pearson Edexcel",
    level: "International A-level",
    title: "Memory models",
    accent: "#9333EA",
    cards: 42,
    due: 4,
    mastered: 81,
    lastStudied: "Yesterday",
  },
  {
    id: "deck-englit-macbeth",
    subjectId: "englit-wjec",
    subject: "English Literature",
    board: "WJEC",
    level: "GCSE",
    title: "Macbeth quotations",
    accent: "#DB2777",
    cards: 30,
    due: 3,
    mastered: 72,
    lastStudied: "3 days ago",
  },
  {
    id: "deck-geo-coasts",
    subjectId: "geo-eduqas",
    subject: "Geography",
    board: "Eduqas",
    level: "GCSE",
    title: "Coastal processes",
    accent: "#D97706",
    cards: 28,
    due: 2,
    mastered: 69,
    lastStudied: "4 days ago",
  },
  {
    id: "deck-history-coldwar",
    subjectId: "history-ccea",
    subject: "History",
    board: "CCEA",
    level: "A-level",
    title: "The Cold War",
    accent: "#B45309",
    cards: 32,
    due: 4,
    mastered: 62,
    lastStudied: "5 days ago",
  },
  {
    id: "deck-physics-waves",
    subjectId: "physics-int-edexcel",
    subject: "Physics",
    board: "Pearson Edexcel",
    level: "International GCSE",
    title: "Waves & electricity",
    accent: "#0891B2",
    cards: 40,
    due: 0,
    mastered: 88,
    lastStudied: "Today",
  },
  {
    id: "deck-cs-databases",
    subjectId: "cs-ocr",
    subject: "Computer Science",
    board: "OCR",
    level: "GCSE",
    title: "Databases & networks",
    accent: "#475569",
    cards: 26,
    due: 2,
    mastered: 66,
    lastStudied: "3 days ago",
  },
  {
    id: "deck-business-finance",
    subjectId: "business-int-edexcel",
    subject: "Business",
    board: "Pearson Edexcel",
    level: "International A-level",
    title: "Finance & cash flow",
    accent: "#DC2626",
    cards: 34,
    due: 3,
    mastered: 57,
    lastStudied: "6 days ago",
  },
];

export const flashcards: Flashcard[] = [
  {
    id: "card-bio-1",
    deckId: "deck-bio-exchange",
    front: "State Fick's law for the rate of diffusion.",
    back: "Rate of diffusion ∝ (surface area × concentration difference) ÷ diffusion distance.",
    hint: "Think area, gradient and thickness.",
  },
  {
    id: "card-bio-2",
    deckId: "deck-bio-exchange",
    front: "How does ventilation maintain gas exchange in the lungs?",
    back: "It replaces oxygenated air with deoxygenated air and removes carbon dioxide, maintaining a steep concentration gradient across the alveolar epithelium.",
    hint: "Focus on the gradient, not the movement muscles.",
  },
  {
    id: "card-bio-3",
    deckId: "deck-bio-exchange",
    front: "Why is a short diffusion distance important?",
    back: "A shorter pathway means diffusion takes less time, so a faster rate of gas exchange can be maintained across the alveolar wall.",
    hint: "Link distance to time.",
  },
  {
    id: "card-bio-4",
    deckId: "deck-bio-exchange",
    front: "Give two features of an efficient exchange surface.",
    back: "A large surface area and a thin, permeable membrane. A steep concentration gradient is also essential.",
    hint: "Surface area and thickness.",
  },
  {
    id: "card-psych-1",
    deckId: "deck-psych-memory",
    front: "Name the three components of the working memory model proposed by Baddeley and Hitch.",
    back: "Central executive, phonological loop and visuospatial sketchpad. The episodic buffer was added later.",
    hint: "One control system and two slave systems.",
  },
  {
    id: "card-psych-2",
    deckId: "deck-psych-memory",
    front: "What is the capacity of short-term memory in the multi-store model?",
    back: "Approximately 7 ± 2 chunks of information.",
    hint: "Miller's magic number.",
  },
];

export const practiceQuestions: PracticeQuestion[] = [
  {
    id: "pq-bio-1",
    subjectId: "bio-aqa",
    subject: "Biology",
    board: "AQA",
    level: "A-level",
    accent: "#7A55F2",
    question:
      "Explain how the structure of the mammalian lung is adapted for efficient gas exchange.",
    modelAnswer:
      "Alveoli provide a large total surface area for diffusion. The alveolar epithelium is one cell thick, and capillaries are close to the alveoli, creating a short diffusion pathway. Ventilation and blood flow maintain a steep concentration gradient for oxygen and carbon dioxide. The moist surface allows gases to dissolve before diffusing.",
    markScheme: [
      "Large surface area provided by many alveoli (1)",
      "Thin epithelium / short diffusion distance (1)",
      "Steep concentration gradient maintained by ventilation and blood flow (1)",
      "Gases dissolve in moisture / capillary network (1)",
    ],
    difficulty: "medium",
    marks: 4,
    topic: "Exchange & transport",
  },
  {
    id: "pq-maths-1",
    subjectId: "maths-edexcel",
    subject: "Mathematics",
    board: "Pearson Edexcel",
    level: "A-level",
    accent: "#2563EB",
    question:
      "Use integration by parts to find ∫ x e^(2x) dx. Show all of your working.",
    modelAnswer:
      "Let u = x and dv = e^(2x) dx, so du = dx and v = ½e^(2x). Then ∫x e^(2x) dx = ½x e^(2x) − ∫½e^(2x) dx = ½x e^(2x) − ¼e^(2x) + C.",
    markScheme: [
      "Correct choice of u and dv (1)",
      "Differentiate u and integrate dv correctly (1)",
      "Apply the integration by parts formula (1)",
      "Correct second integral (1)",
      "Include + C and simplify (1)",
    ],
    difficulty: "hard",
    marks: 5,
    topic: "Integration by parts",
  },
  {
    id: "pq-chem-1",
    subjectId: "chem-ocr",
    subject: "Chemistry",
    board: "OCR",
    level: "A-level",
    accent: "#059669",
    question:
      "Describe the mechanism for the nucleophilic substitution of bromoethane by hydroxide ions.",
    modelAnswer:
      "The hydroxide ion acts as a nucleophile and donates an electron pair to the partially positive carbon. A curly arrow is drawn from the lone pair on the hydroxide to the carbon. The C–Br bond breaks heterolytically and a curly arrow is drawn from the bond to the bromine. The products are ethanol and a bromide ion. A primary halogenoalkane favours an SN2 mechanism.",
    markScheme: [
      "OH⁻ identified as a nucleophile (1)",
      "Curly arrow from lone pair to carbon (1)",
      "Curly arrow from C–Br bond to Br (1)",
      "Correct products: ethanol and bromide ion (1)",
      "SN2 mechanism for a primary halogenoalkane (1)",
    ],
    difficulty: "medium",
    marks: 5,
    topic: "Organic mechanisms",
  },
  {
    id: "pq-englit-1",
    subjectId: "englit-wjec",
    subject: "English Literature",
    board: "WJEC",
    level: "GCSE",
    accent: "#DB2777",
    question:
      "How does Shakespeare present ambition in Macbeth? Write about an extract and the whole play.",
    modelAnswer:
      "Shakespeare presents ambition as a corrupting force that begins as a possibility and becomes a compulsion. Macbeth's 'vaulting ambition' metaphor suggests an energy that overreaches itself. The imperative 'Stars, hide your fires' reveals his attempt to conceal immoral desire. By the end, ambition has isolated him, and the repeated imagery of blood and darkness shows its psychological cost.",
    markScheme: [
      "Precise quotation and analysis of language (AO1/AO2)",
      "Clear argument about ambition across the whole play (AO1)",
      "Contextual understanding of kingship and the tragic form (AO3)",
      "Coherent structure with purposeful links (AO1)",
      "Accurate subject terminology such as metaphor and imperative (AO2)",
    ],
    difficulty: "hard",
    marks: 30,
    topic: "Macbeth",
  },
  {
    id: "pq-geo-1",
    subjectId: "geo-eduqas",
    subject: "Geography",
    board: "Eduqas",
    level: "GCSE",
    accent: "#D97706",
    question:
      "Explain how longshore drift contributes to the formation of a spit.",
    modelAnswer:
      "Waves approach the coast at an angle determined by the prevailing wind. The swash carries sediment up the beach at this angle, while the backwash returns it perpendicular to the shore. This zig-zag movement transports material along the coast. Where the coastline changes direction or a river mouth interrupts the flow, sediment is deposited offshore, building a spit.",
    markScheme: [
      "Waves approach at an angle / prevailing wind (1)",
      "Swash and backwash described with direction (1)",
      "Zig-zag movement transports sediment along the coast (1)",
      "Deposition occurs where coastline changes direction or at a river mouth (1)",
      "Spit extends into the sea (1)",
    ],
    difficulty: "medium",
    marks: 4,
    topic: "Coastal landforms",
  },
  {
    id: "pq-history-1",
    subjectId: "history-ccea",
    subject: "History",
    board: "CCEA",
    level: "A-level",
    accent: "#B45309",
    question:
      "Assess the view that détente did little to reduce Cold War tensions. (25 marks)",
    modelAnswer:
      "Détente reduced the risk of direct nuclear confrontation through arms control agreements such as SALT I, but it did not remove the ideological rivalry. Proxy conflicts in Vietnam, the Middle East and Angola continued. The Helsinki Accords offered a framework for cooperation, yet the human rights provisions were used by critics to increase pressure on the Soviet Union. Afghanistan in 1979 demonstrated the limits of détente. Overall, détente managed tensions rather than resolving them.",
    markScheme: [
      "Clear judgement sustained throughout (AO1)",
      "Accurate use of key events and dates (AO1)",
      "Analysis of the limits and achievements of détente (AO1/AO2)",
      "Engagement with different interpretations (AO2)",
      "Well-structured argument with a substantiated conclusion (AO1)",
    ],
    difficulty: "hard",
    marks: 25,
    topic: "The Cold War",
  },
  {
    id: "pq-physics-1",
    subjectId: "physics-int-edexcel",
    subject: "Physics",
    board: "Pearson Edexcel",
    level: "International GCSE",
    accent: "#0891B2",
    question:
      "Describe the difference between transverse and longitudinal waves.",
    modelAnswer:
      "In a transverse wave, the oscillations are perpendicular to the direction of energy transfer, for example light waves. In a longitudinal wave, the oscillations are parallel to the direction of energy transfer, producing compressions and rarefactions, for example sound waves.",
    markScheme: [
      "Transverse: oscillations perpendicular to energy transfer (1)",
      "Longitudinal: oscillations parallel to energy transfer (1)",
      "Appropriate example for each type (1)",
    ],
    difficulty: "easy",
    marks: 3,
    topic: "Waves",
  },
  {
    id: "pq-psych-1",
    subjectId: "psych-int-edexcel",
    subject: "Psychology",
    board: "Pearson Edexcel",
    level: "International A-level",
    accent: "#9333EA",
    question:
      "Evaluate the working memory model. (12 marks)",
    modelAnswer:
      "The model is supported by dual-task studies that show interference is greater when tasks use the same component, increasing its validity. Case studies of patients with brain damage provide further support for separate components. However, the central executive is poorly specified and difficult to test directly. The model also focuses on short-term memory and says less about long-term memory. Overall, it is a useful advance on the multi-store model but not a complete account.",
    markScheme: [
      "Strengths supported with evidence (AO1/AO3)",
      "Limitations such as the central executive (AO3)",
      "Comparison with the multi-store model (AO1)",
      "Balance and a substantiated conclusion (AO3)",
      "Accurate use of psychological terminology (AO1)",
    ],
    difficulty: "hard",
    marks: 12,
    topic: "Memory models",
  },
  {
    id: "pq-cs-1",
    subjectId: "cs-ocr",
    subject: "Computer Science",
    board: "OCR",
    level: "GCSE",
    accent: "#475569",
    question:
      "Explain the purpose of a primary key and a foreign key in a relational database.",
    modelAnswer:
      "A primary key uniquely identifies each record in a table and cannot be null. A foreign key is an attribute in one table that refers to the primary key in another table, creating a relationship between the tables and helping to maintain referential integrity.",
    markScheme: [
      "Primary key uniquely identifies a record (1)",
      "Primary key cannot be null / is unique (1)",
      "Foreign key links to a primary key in another table (1)",
      "Maintains relationships / referential integrity (1)",
    ],
    difficulty: "easy",
    marks: 4,
    topic: "Databases",
  },
];

export const pastPapers: PastPaper[] = [
  {
    id: "pp-bio-2025-1",
    subjectId: "bio-aqa",
    subject: "Biology",
    board: "AQA",
    level: "A-level",
    year: 2025,
    session: "June",
    paperCode: "7402/1",
    title: "Paper 1 — Introductory topics in biology",
    durationMinutes: 120,
    marks: 91,
    hasMarkScheme: true,
  },
  {
    id: "pp-bio-2024-2",
    subjectId: "bio-aqa",
    subject: "Biology",
    board: "AQA",
    level: "A-level",
    year: 2024,
    session: "June",
    paperCode: "7402/2",
    title: "Paper 2 — Advanced topics in biology",
    durationMinutes: 120,
    marks: 91,
    hasMarkScheme: true,
  },
  {
    id: "pp-maths-2025-1",
    subjectId: "maths-edexcel",
    subject: "Mathematics",
    board: "Pearson Edexcel",
    level: "A-level",
    year: 2025,
    session: "June",
    paperCode: "9MA0/01",
    title: "Pure Mathematics 1",
    durationMinutes: 120,
    marks: 100,
    hasMarkScheme: true,
  },
  {
    id: "pp-chem-2024-1",
    subjectId: "chem-ocr",
    subject: "Chemistry",
    board: "OCR",
    level: "A-level",
    year: 2024,
    session: "June",
    paperCode: "H432/01",
    title: "Periodic table, elements and physical chemistry",
    durationMinutes: 135,
    marks: 100,
    hasMarkScheme: true,
  },
  {
    id: "pp-englit-2024-1",
    subjectId: "englit-wjec",
    subject: "English Literature",
    board: "WJEC",
    level: "GCSE",
    year: 2024,
    session: "Summer",
    paperCode: "C720U10-1",
    title: "Unit 1 — Shakespeare and poetry",
    durationMinutes: 90,
    marks: 60,
    hasMarkScheme: true,
  },
  {
    id: "pp-geo-2025-1",
    subjectId: "geo-eduqas",
    subject: "Geography",
    board: "Eduqas",
    level: "GCSE",
    year: 2025,
    session: "Summer",
    paperCode: "C111U10-1",
    title: "Component 1 — Changing physical and human landscapes",
    durationMinutes: 90,
    marks: 90,
    hasMarkScheme: true,
  },
  {
    id: "pp-history-2024-1",
    subjectId: "history-ccea",
    subject: "History",
    board: "CCEA",
    level: "A-level",
    year: 2024,
    session: "Summer",
    paperCode: "H201/1",
    title: "A2 1 — Historical investigations",
    durationMinutes: 90,
    marks: 60,
    hasMarkScheme: true,
  },
  {
    id: "pp-physics-2025-1",
    subjectId: "physics-int-edexcel",
    subject: "Physics",
    board: "Pearson Edexcel",
    level: "International GCSE",
    year: 2025,
    session: "January",
    paperCode: "4PH1/1P",
    title: "Physics Paper 1",
    durationMinutes: 120,
    marks: 110,
    hasMarkScheme: true,
  },
  {
    id: "pp-psych-2024-1",
    subjectId: "psych-int-edexcel",
    subject: "Psychology",
    board: "Pearson Edexcel",
    level: "International A-level",
    year: 2024,
    session: "October",
    paperCode: "WPS01/01",
    title: "Paper 1 — Social and cognitive psychology",
    durationMinutes: 120,
    marks: 90,
    hasMarkScheme: true,
  },
  {
    id: "pp-cs-2025-1",
    subjectId: "cs-ocr",
    subject: "Computer Science",
    board: "OCR",
    level: "GCSE",
    year: 2025,
    session: "June",
    paperCode: "J277/01",
    title: "Computer systems",
    durationMinutes: 90,
    marks: 80,
    hasMarkScheme: true,
  },
  {
    id: "pp-business-2024-1",
    subjectId: "business-int-edexcel",
    subject: "Business",
    board: "Pearson Edexcel",
    level: "International A-level",
    year: 2024,
    session: "June",
    paperCode: "YBS11/01",
    title: "Paper 1 — Markets, consumers and firms",
    durationMinutes: 120,
    marks: 80,
    hasMarkScheme: true,
  },
];

export const plannerTasks: PlannerTask[] = [
  {
    id: "task-1",
    day: "Mon",
    date: "2 Nov",
    time: "16:30",
    title: "Exchange surfaces recall",
    subject: "Biology",
    board: "AQA",
    level: "A-level",
    accent: "#7A55F2",
    duration: 45,
    priority: "medium",
    completed: true,
    type: "review",
  },
  {
    id: "task-2",
    day: "Mon",
    date: "2 Nov",
    time: "18:00",
    title: "Integration by parts — Set B",
    subject: "Mathematics",
    board: "Pearson Edexcel",
    level: "A-level",
    accent: "#2563EB",
    duration: 50,
    priority: "high",
    completed: true,
    type: "practice",
  },
  {
    id: "task-3",
    day: "Tue",
    date: "3 Nov",
    time: "17:00",
    title: "Working memory essay plan",
    subject: "Psychology",
    board: "Pearson Edexcel",
    level: "International A-level",
    accent: "#9333EA",
    duration: 40,
    priority: "high",
    completed: true,
    type: "notes",
  },
  {
    id: "task-4",
    day: "Wed",
    date: "4 Nov",
    time: "16:00",
    title: "Nucleophilic substitution",
    subject: "Chemistry",
    board: "OCR",
    level: "A-level",
    accent: "#059669",
    duration: 45,
    priority: "medium",
    completed: true,
    type: "notes",
  },
  {
    id: "task-5",
    day: "Wed",
    date: "4 Nov",
    time: "18:30",
    title: "Macbeth quotation drill",
    subject: "English Literature",
    board: "WJEC",
    level: "GCSE",
    accent: "#DB2777",
    duration: 30,
    priority: "low",
    completed: true,
    type: "review",
  },
  {
    id: "task-6",
    day: "Thu",
    date: "5 Nov",
    time: "15:30",
    title: "Détente source question",
    subject: "History",
    board: "CCEA",
    level: "A-level",
    accent: "#B45309",
    duration: 45,
    priority: "medium",
    completed: true,
    type: "practice",
  },
  {
    id: "task-7",
    day: "Fri",
    date: "6 Nov",
    time: "17:30",
    title: "Waves past paper",
    subject: "Physics",
    board: "Pearson Edexcel",
    level: "International GCSE",
    accent: "#0891B2",
    duration: 60,
    priority: "high",
    completed: true,
    type: "paper",
  },
  {
    id: "task-8",
    day: "Sat",
    date: "7 Nov",
    time: "10:00",
    title: "Coastal case studies",
    subject: "Geography",
    board: "Eduqas",
    level: "GCSE",
    accent: "#D97706",
    duration: 40,
    priority: "low",
    completed: true,
    type: "notes",
  },
  {
    id: "task-9",
    day: "Sat",
    date: "7 Nov",
    time: "14:00",
    title: "Timed Pure Paper 1",
    subject: "Mathematics",
    board: "Pearson Edexcel",
    level: "A-level",
    accent: "#2563EB",
    duration: 120,
    priority: "high",
    completed: true,
    type: "paper",
  },
  {
    id: "task-10",
    day: "Sun",
    date: "8 Nov",
    time: "11:00",
    title: "Biology flashcard sprint",
    subject: "Biology",
    board: "AQA",
    level: "A-level",
    accent: "#7A55F2",
    duration: 30,
    priority: "medium",
    completed: true,
    type: "review",
  },
  {
    id: "task-11",
    day: "Sun",
    date: "8 Nov",
    time: "18:00",
    title: "Psychology essay plan",
    subject: "Psychology",
    board: "Pearson Edexcel",
    level: "International A-level",
    accent: "#9333EA",
    duration: 45,
    priority: "high",
    completed: false,
    type: "notes",
  },
  {
    id: "task-12",
    day: "Sun",
    date: "8 Nov",
    time: "19:30",
    title: "Maths corrections review",
    subject: "Mathematics",
    board: "Pearson Edexcel",
    level: "A-level",
    accent: "#2563EB",
    duration: 30,
    priority: "medium",
    completed: false,
    type: "review",
  },
];

export const weeklyStudy: WeeklyStudyPoint[] = [
  { day: "Mon", minutes: 48 },
  { day: "Tue", minutes: 66 },
  { day: "Wed", minutes: 30 },
  { day: "Thu", minutes: 72 },
  { day: "Fri", minutes: 54 },
  { day: "Sat", minutes: 96 },
  { day: "Sun", minutes: 36 },
];

export const assessments: Assessment[] = [
  {
    id: "assessment-1",
    title: "Biology mock — Paper 1",
    subject: "Biology",
    board: "AQA",
    level: "A-level",
    date: "Thu 12 Nov",
    daysAway: 4,
    accent: "#7A55F2",
    type: "Mock exam",
  },
  {
    id: "assessment-2",
    title: "Chemistry timed paper",
    subject: "Chemistry",
    board: "OCR",
    level: "A-level",
    date: "Wed 18 Nov",
    daysAway: 10,
    accent: "#059669",
    type: "In-class assessment",
  },
  {
    id: "assessment-3",
    title: "Mathematics Pure Paper 1",
    subject: "Mathematics",
    board: "Pearson Edexcel",
    level: "A-level",
    date: "Mon 23 Nov",
    daysAway: 15,
    accent: "#2563EB",
    type: "Mock exam",
  },
];

export const dashboardActivity = [
  {
    id: "activity-1",
    title: "Reviewed 18 Biology flashcards",
    detail: "Exchange surfaces · 84% recalled",
    time: "Today, 11:20",
    accent: "#7A55F2",
  },
  {
    id: "activity-2",
    title: "Completed a Maths past paper",
    detail: "Pure Paper 1 · 78/100",
    time: "Yesterday, 16:10",
    accent: "#2563EB",
  },
  {
    id: "activity-3",
    title: "Updated Psychology notes",
    detail: "Memory models · added evaluation points",
    time: "Yesterday, 14:05",
    accent: "#9333EA",
  },
  {
    id: "activity-4",
    title: "Practised History essay",
    detail: "Détente · 25-mark plan",
    time: "Fri, 15:40",
    accent: "#B45309",
  },
];

export const masteryTrend = [48, 51, 53, 56, 58, 60, 63, 65];

export const boardCoverage = EXAM_BOARDS.map((board) => ({
  board,
  subjects: subjects.filter((subject) => subject.board === board).length,
}));

export const subjectGradeRows = [
  {
    subject: "Biology",
    board: "AQA" as ExamBoard,
    target: "A*",
    predicted: "A",
    latest: "72%",
    trend: "up" as const,
  },
  {
    subject: "Mathematics",
    board: "Pearson Edexcel" as ExamBoard,
    target: "A",
    predicted: "A",
    latest: "68%",
    trend: "up" as const,
  },
  {
    subject: "Chemistry",
    board: "OCR" as ExamBoard,
    target: "A",
    predicted: "B",
    latest: "61%",
    trend: "flat" as const,
  },
  {
    subject: "English Literature",
    board: "WJEC" as ExamBoard,
    target: "9",
    predicted: "8",
    latest: "74%",
    trend: "up" as const,
  },
  {
    subject: "Geography",
    board: "Eduqas" as ExamBoard,
    target: "8",
    predicted: "7",
    latest: "63%",
    trend: "down" as const,
  },
  {
    subject: "History",
    board: "CCEA" as ExamBoard,
    target: "A",
    predicted: "B",
    latest: "58%",
    trend: "up" as const,
  },
];

export function getSubject(subjectId: string): Subject | undefined {
  return subjects.find((subject) => subject.id === subjectId);
}

export function getSubjectName(subjectId: string): string {
  return getSubject(subjectId)?.name ?? "Subject";
}
