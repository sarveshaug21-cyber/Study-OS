// Subject and topic taxonomy.
//
// A single, consistent hierarchy used across the whole product:
//
//   Subject family (e.g. "Biology")
//     └── Unit      (e.g. "Exchange surfaces and transport")
//           └── Chapter (e.g. "Gas exchange")
//                 └── Topic (e.g. "Fick's law")
//
// The taxonomy is *descriptive metadata*: it tells the app how subjects,
// chapters and topics relate and how they are ordered. It deliberately does
// not restate board syllabus content — specification coverage is tracked
// separately (see lib/specifications.ts).

export const SUBJECT_FAMILIES = [
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "English Literature",
  "Geography",
  "History",
  "Psychology",
  "Computer Science",
  "Business",
  "Economics",
  "Sociology",
  "Religious Studies",
  "Media Studies",
  "Design & Technology",
  "Physical Education",
  "Modern Foreign Languages",
  "Further Mathematics",
] as const;

export type SubjectFamily = (typeof SUBJECT_FAMILIES)[number];

/** Broad grouping used for dashboard colour-coding and filtering. */
export const SUBJECT_SECTORS = [
  "Science",
  "Mathematical",
  "Humanities",
  "Social Science",
  "Technical",
  "Creative",
  "Languages",
] as const;

export type SubjectSector = (typeof SUBJECT_SECTORS)[number];

export type SubjectProfile = {
  family: SubjectFamily;
  sector: SubjectSector;
  /** Which qualifications this subject is typically offered in. */
  offeredAt: readonly string[];
  /** Whether the subject is commonly assessed with coursework as well as exams. */
  hasCoursework: boolean;
  /** Typical weekly revision minutes recommended for exam-year students. */
  recommendedMinutesPerWeek: number;
};

export const SUBJECT_PROFILES: Record<SubjectFamily, SubjectProfile> = {
  Biology: {
    family: "Biology",
    sector: "Science",
    offeredAt: ["GCSE", "International GCSE", "A-level", "International A-level"],
    hasCoursework: true,
    recommendedMinutesPerWeek: 180,
  },
  Chemistry: {
    family: "Chemistry",
    sector: "Science",
    offeredAt: ["GCSE", "International GCSE", "A-level", "International A-level"],
    hasCoursework: true,
    recommendedMinutesPerWeek: 180,
  },
  Physics: {
    family: "Physics",
    sector: "Science",
    offeredAt: ["GCSE", "International GCSE", "A-level", "International A-level"],
    hasCoursework: true,
    recommendedMinutesPerWeek: 180,
  },
  Mathematics: {
    family: "Mathematics",
    sector: "Mathematical",
    offeredAt: ["GCSE", "International GCSE", "A-level", "International A-level"],
    hasCoursework: false,
    recommendedMinutesPerWeek: 210,
  },
  "English Literature": {
    family: "English Literature",
    sector: "Humanities",
    offeredAt: ["GCSE", "International GCSE", "A-level", "International A-level"],
    hasCoursework: true,
    recommendedMinutesPerWeek: 150,
  },
  Geography: {
    family: "Geography",
    sector: "Humanities",
    offeredAt: ["GCSE", "International GCSE", "A-level", "International A-level"],
    hasCoursework: true,
    recommendedMinutesPerWeek: 120,
  },
  History: {
    family: "History",
    sector: "Humanities",
    offeredAt: ["GCSE", "International GCSE", "A-level", "International A-level"],
    hasCoursework: true,
    recommendedMinutesPerWeek: 120,
  },
  Psychology: {
    family: "Psychology",
    sector: "Social Science",
    offeredAt: ["GCSE", "International GCSE", "A-level", "International A-level"],
    hasCoursework: true,
    recommendedMinutesPerWeek: 120,
  },
  "Computer Science": {
    family: "Computer Science",
    sector: "Technical",
    offeredAt: ["GCSE", "A-level"],
    hasCoursework: true,
    recommendedMinutesPerWeek: 150,
  },
  Business: {
    family: "Business",
    sector: "Social Science",
    offeredAt: ["GCSE", "International GCSE", "A-level", "International A-level"],
    hasCoursework: true,
    recommendedMinutesPerWeek: 120,
  },
  Economics: {
    family: "Economics",
    sector: "Social Science",
    offeredAt: ["GCSE", "International GCSE", "A-level", "International A-level"],
    hasCoursework: false,
    recommendedMinutesPerWeek: 120,
  },
  Sociology: {
    family: "Sociology",
    sector: "Social Science",
    offeredAt: ["GCSE", "A-level"],
    hasCoursework: true,
    recommendedMinutesPerWeek: 120,
  },
  "Religious Studies": {
    family: "Religious Studies",
    sector: "Humanities",
    offeredAt: ["GCSE", "A-level"],
    hasCoursework: true,
    recommendedMinutesPerWeek: 90,
  },
  "Media Studies": {
    family: "Media Studies",
    sector: "Creative",
    offeredAt: ["A-level"],
    hasCoursework: true,
    recommendedMinutesPerWeek: 120,
  },
  "Design & Technology": {
    family: "Design & Technology",
    sector: "Creative",
    offeredAt: ["GCSE", "A-level"],
    hasCoursework: true,
    recommendedMinutesPerWeek: 120,
  },
  "Physical Education": {
    family: "Physical Education",
    sector: "Creative",
    offeredAt: ["GCSE", "A-level"],
    hasCoursework: true,
    recommendedMinutesPerWeek: 90,
  },
  "Modern Foreign Languages": {
    family: "Modern Foreign Languages",
    sector: "Languages",
    offeredAt: ["GCSE", "International GCSE", "A-level", "International A-level"],
    hasCoursework: true,
    recommendedMinutesPerWeek: 150,
  },
  "Further Mathematics": {
    family: "Further Mathematics",
    sector: "Mathematical",
    offeredAt: ["A-level"],
    hasCoursework: false,
    recommendedMinutesPerWeek: 120,
  },
};

export function isSubjectFamily(value: unknown): value is SubjectFamily {
  return (
    typeof value === "string" &&
    (SUBJECT_FAMILIES as readonly string[]).includes(value)
  );
}

export function getSubjectProfile(family: string): SubjectProfile | null {
  if (!isSubjectFamily(family)) return null;
  return SUBJECT_PROFILES[family];
}

/** Map a free-text subject name onto a known family where possible. */
export function resolveSubjectFamily(name: string): SubjectFamily | null {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return null;
  const exact = SUBJECT_FAMILIES.find(
    (family) => family.toLowerCase() === normalized,
  );
  if (exact) return exact;
  // Word-boundary partial match: "physics" resolves to "Physics", but
  // "astrophysics" must not (it is a distinct subject). Lookarounds are used
  // so substrings of a family name do not leak into other families.
  const escaped = SUBJECT_FAMILIES.map((family) =>
    family
      .toLowerCase()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const pattern = new RegExp(`(?<![a-z0-9])(${escaped.join("|")})(?![a-z0-9])`);
  const match = normalized.match(pattern);
  if (!match) return null;
  return SUBJECT_FAMILIES.find(
    (family) => family.toLowerCase() === match[1].toLowerCase(),
  ) ?? null;
}

export const TAXONOMY_LEVELS = [
  "subject",
  "unit",
  "chapter",
  "topic",
] as const;

export type TaxonomyLevel = (typeof TAXONOMY_LEVELS)[number];

export type TaxonomyNode = {
  /** Stable id, unique within the taxonomy. */
  id: string;
  /** Display name. */
  name: string;
  /** Depth in the hierarchy. */
  level: TaxonomyLevel;
  /** Parent node id; null for top-level nodes. */
  parentId: string | null;
  /** Sibling ordering. */
  sortOrder: number;
  /** Short description used in navigation tooltips. */
  description?: string;
};

export type TaxonomyTree = {
  nodes: TaxonomyNode[];
  roots: string[];
  childrenByParent: Record<string, string[]>;
  nodeById: Record<string, TaxonomyNode>;
  depthById: Record<string, number>;
};

/**
 * Build an indexed tree from a flat list of nodes. Nodes whose parent is
 * missing are treated as roots so a partially imported syllabus still renders
 * a usable navigation tree instead of disappearing.
 */
export function buildTaxonomyTree(nodes: TaxonomyNode[]): TaxonomyTree {
  const nodeById: Record<string, TaxonomyNode> = {};
  for (const node of nodes) nodeById[node.id] = node;

  const childrenByParent: Record<string, string[]> = {};
  const roots: string[] = [];

  for (const node of nodes) {
    const parentId =
      node.parentId && node.parentId !== node.id && nodeById[node.parentId]
        ? node.parentId
        : null;
    const effective = { ...node, parentId };
    nodeById[node.id] = effective;
    if (!parentId) {
      roots.push(node.id);
      continue;
    }
    (childrenByParent[parentId] ??= []).push(node.id);
  }

  for (const key of Object.keys(childrenByParent)) {
    childrenByParent[key].sort((a, b) => {
      const left = nodeById[a];
      const right = nodeById[b];
      if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
      return left.name.localeCompare(right.name);
    });
  }
  roots.sort((a, b) => {
    const left = nodeById[a];
    const right = nodeById[b];
    if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
    return left.name.localeCompare(right.name);
  });

  const depthById: Record<string, number> = {};
  const assignDepth = (id: string, depth: number, seen: Set<string>) => {
    if (seen.has(id)) return;
    seen.add(id);
    depthById[id] = depth;
    for (const child of childrenByParent[id] ?? []) {
      assignDepth(child, depth + 1, seen);
    }
  };
  const seen = new Set<string>();
  for (const root of roots) assignDepth(root, 0, seen);

  return { nodes, roots, childrenByParent, nodeById, depthById };
}

/**
 * Flatten a tree into an ordered list, depth-first. Used for rendering
 * navigation and for producing a linear revision order.
 */
export function flattenTaxonomy(tree: TaxonomyTree): TaxonomyNode[] {
  const out: TaxonomyNode[] = [];
  const walk = (id: string) => {
    const node = tree.nodeById[id];
    if (!node) return;
    out.push(node);
    for (const child of tree.childrenByParent[id] ?? []) walk(child);
  };
  for (const root of tree.roots) walk(root);
  return out;
}

/**
 * Ancestors of a node, closest first. Used for breadcrumbs.
 */
export function taxonomyAncestors(
  tree: TaxonomyTree,
  id: string,
): TaxonomyNode[] {
  const ancestors: TaxonomyNode[] = [];
  let current = tree.nodeById[id]?.parentId ?? null;
  const guard = new Set<string>();
  while (current && !guard.has(current)) {
    guard.add(current);
    const node = tree.nodeById[current];
    if (!node) break;
    ancestors.unshift(node);
    current = node.parentId;
  }
  return ancestors;
}

/** Human-readable path for a node, e.g. "Biology › Exchange surfaces › Fick's law". */
export function taxonomyPath(
  tree: TaxonomyTree,
  id: string,
  separator = " › ",
): string {
  const node = tree.nodeById[id];
  if (!node) return "";
  const parts = [...taxonomyAncestors(tree, id).map((n) => n.name), node.name];
  return parts.join(separator);
}

/**
 * Recommend the next topic to study: the first uncompleted topic in
 * depth-first order whose ancestors are all complete. Roots (no parent) are
 * always eligible. Returns null when every topic is complete or none is ready.
 */
export function recommendedNextTopic(
  tree: TaxonomyTree,
  completed: Record<string, boolean> | Map<string, boolean>,
): TaxonomyNode | null {
  const isCompleted = (id: string) =>
    completed instanceof Map ? completed.get(id) === true : completed[id] === true;

  const ancestorsComplete = (id: string): boolean => {
    const node = tree.nodeById[id];
    let current = node?.parentId ?? null;
    const seen = new Set<string>();
    while (current && !seen.has(current)) {
      seen.add(current);
      if (!isCompleted(current)) return false;
      current = tree.nodeById[current]?.parentId ?? null;
    }
    return true;
  };

  for (const node of flattenTaxonomy(tree)) {
    if (
      node.level === "topic" &&
      !isCompleted(node.id) &&
      ancestorsComplete(node.id)
    ) {
      return node;
    }
  }
  return null;
}

/** Deterministic id for a taxonomy node path, e.g. "bio.exchange.fick". */
export function taxonomySlug(...parts: string[]): string {
  return parts
    .join(".")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
