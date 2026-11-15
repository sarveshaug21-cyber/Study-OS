// Prerequisite intelligence.
//
// Concepts build on other concepts. This module models those dependencies as
// a directed graph and turns it into a recommended learning order, so a
// student who is struggling with "quadratic equations" is told to revise
// "expanding brackets" first.
//
// The graph is derived from a curriculum-wide rule set, never invented per
// student: dependencies are declared against topic *concepts* and resolved to
// the student's own topics by name matching.

export type PrerequisiteStrength = "required" | "helpful";

export type PrerequisiteRule = {
  /** Concept that needs prior knowledge. */
  concept: string;
  /** Concept that should be learned first. */
  requires: string;
  strength: PrerequisiteStrength;
  /** Short explanation shown to the student. */
  reason: string;
};

/**
 * Curriculum-wide prerequisite rules.
 *
 * Keyed on concept names that appear in real GCSE / A-level syllabuses.
 * Matching to a student's own topics is done at runtime by name, so no
 * syllabus content is duplicated here.
 */
export const PREREQUISITE_RULES: readonly PrerequisiteRule[] = [
  // Mathematics
  { concept: "Expanding brackets", requires: "Multiplication tables", strength: "required", reason: "Every expansion is a sequence of multiplications." },
  { concept: "Simplifying algebraic expressions", requires: "Expanding brackets", strength: "required", reason: "Simplifying often starts by expanding a bracket." },
  { concept: "Solving linear equations", requires: "Simplifying algebraic expressions", strength: "required", reason: "Rearranging and dividing both need fluent manipulation of expressions." },
  { concept: "Quadratic equations", requires: "Solving linear equations", strength: "required", reason: "The factorise-and-solve method rearranges to zero first." },
  { concept: "Simultaneous equations", requires: "Solving linear equations", strength: "required", reason: "Substitution and elimination both build on rearranging equations." },
  { concept: "Graphs of functions", requires: "Solving linear equations", strength: "helpful", reason: "Reading intercepts and solving for x uses algebra." },
  { concept: "Indices", requires: "Powers of a number", strength: "required", reason: "Index laws are written using powers." },
  { concept: "Standard form", requires: "Indices", strength: "required", reason: "Standard form is index manipulation on powers of ten." },
  { concept: "Ratio and proportion", requires: "Fractions", strength: "required", reason: "Ratio questions are solved with fraction methods." },
  { concept: "Compound interest", requires: "Indices", strength: "required", reason: "Compound interest is repeated multiplication, written with indices." },
  { concept: "Circle theorems", requires: "Angles in polygons", strength: "required", reason: "Every circle theorem is proved using the angle rules for polygons." },
  { concept: "Pythagoras' theorem", requires: "Squares and square roots", strength: "required", reason: "The theorem is applied by squaring the side lengths." },
  { concept: "Trigonometry", requires: "Pythagoras' theorem", strength: "required", reason: "The sine and cosine rules extend Pythagoras." },
  { concept: "Trigonometry", requires: "Angles in polygons", strength: "helpful", reason: "Angle reasoning underpins the trig identities." },
  { concept: "Differentiation", requires: "Limits", strength: "required", reason: "Differentiation is defined as a limit of a gradient." },
  { concept: "Differentiation", requires: "Indices", strength: "required", reason: "The power rule is an index rule." },
  { concept: "Integration", requires: "Differentiation", strength: "required", reason: "Integration reverses differentiation." },
  { concept: "Integration by parts", requires: "Integration", strength: "required", reason: "Integration by parts is a technique applied inside integration." },
  { concept: "Vectors", requires: "Coordinates", strength: "required", reason: "Vectors are built from coordinate differences." },
  { concept: "Further mathematics", requires: "Differentiation", strength: "helpful", reason: "Further topics extend the same calculus ideas." },

  // Biology
  { concept: "Cell structure", requires: "Microscopy", strength: "helpful", reason: "Seeing cells requires understanding magnification." },
  { concept: "Cell structure", requires: "Chemical elements", strength: "helpful", reason: "Cell chemistry depends on knowing the elements involved." },
  { concept: "Transport in cells", requires: "Cell structure", strength: "required", reason: "Transport across membranes depends on membrane structure." },
  { concept: "Exchange surfaces", requires: "Transport in cells", strength: "required", reason: "Exchange surfaces rely on diffusion and active transport." },
  { concept: "Enzymes", requires: "Proteins", strength: "required", reason: "Enzymes are proteins, so protein structure comes first." },
  { concept: "Photosynthesis", requires: "Enzymes", strength: "required", reason: "Photosynthesis is controlled by enzymes." },
  { concept: "Photosynthesis", requires: "Cell structure", strength: "required", reason: "Chloroplasts are described using cell organelles." },
  { concept: "Respiration", requires: "Enzymes", strength: "required", reason: "Respiration is a series of enzyme-controlled reactions." },
  { concept: "Circulation", requires: "Exchange surfaces", strength: "required", reason: "The circulatory system exists to service exchange surfaces." },
  { concept: "Genetics", requires: "Cell division", strength: "required", reason: "Inheritance is explained through meiosis." },
  { concept: "Evolution", requires: "Genetics", strength: "required", reason: "Natural selection acts on heritable variation." },
  { concept: "Ecology", requires: "Classification", strength: "helpful", reason: "Ecological work uses classification of organisms." },
  { concept: "Homeostasis", requires: "Enzymes", strength: "required", reason: "Enzyme control underpins temperature and blood-glucose regulation." },

  // Chemistry
  { concept: "Atomic structure", requires: "Chemical elements", strength: "required", reason: "Atoms are described in terms of the elements." },
  { concept: "Chemical bonding", requires: "Atomic structure", strength: "required", reason: "Bonding explains how atoms combine." },
  { concept: "The periodic table", requires: "Atomic structure", strength: "required", reason: "Group and period trends come from electron arrangement." },
  { concept: "Chemical calculations", requires: "The periodic table", strength: "required", reason: "Molar masses come from the periodic table." },
  { concept: "Chemical calculations", requires: "Equations", strength: "required", reason: "Stoichiometry needs balanced equations." },
  { concept: "Reactions of metals", requires: "Chemical bonding", strength: "required", reason: "Metal reactivity is explained by bonding and electron transfer." },
  { concept: "Electrolysis", requires: "Chemical calculations", strength: "required", reason: "Faraday calculations use moles of electrons." },
  { concept: "Electrolysis", requires: "Redox reactions", strength: "required", reason: "Electrolysis is a redox process." },
  { concept: "Acids, bases and salts", requires: "Equations", strength: "required", reason: "Neutralisation is written and balanced as an equation." },
  { concept: "Energy changes", requires: "Chemical bonding", strength: "required", reason: "Bond breaking and forming explain energy changes." },
  { concept: "Rates of reaction", requires: "Energy changes", strength: "required", reason: "Activation energy comes from the energy-change model." },
  { concept: "Organic chemistry", requires: "Chemical bonding", strength: "required", reason: "Functional groups depend on how carbon bonds." },
  { concept: "Organic chemistry", requires: "Chemical calculations", strength: "helpful", reason: "Quantitative organic work uses mole calculations." },

  // Physics
  { concept: "Energy", requires: "Units and measurement", strength: "required", reason: "Energy work depends on careful unit handling." },
  { concept: "Forces and motion", requires: "Energy", strength: "required", reason: "Work and power are energy transfers." },
  { concept: "Forces and motion", requires: "Graphs of functions", strength: "required", reason: "Velocity–time and distance–time graphs are interpreted as functions." },
  { concept: "Waves", requires: "Sound and light", strength: "helpful", reason: "Wave properties explain both sound and light." },
  { concept: "Electricity", requires: "Units and measurement", strength: "required", reason: "Current and voltage require careful unit handling." },
  { concept: "Electricity", requires: "Atomic structure", strength: "helpful", reason: "Current is explained by electron behaviour." },
  { concept: "Electromagnetic induction", requires: "Electricity", strength: "required", reason: "Induced potential difference is an electrical effect." },
  { concept: "Electromagnetic induction", requires: "Waves", strength: "required", reason: "A changing magnetic field is described in wave terms." },
  { concept: "Radioactivity", requires: "Atomic structure", strength: "required", reason: "Nuclear decay changes the nucleus." },
  { concept: "Radioactivity", requires: "Chemical calculations", strength: "helpful", reason: "Half-life and decay questions use mathematical reasoning." },

  // Chemistry and physics shared
  { concept: "Chemical calculations", requires: "Fractions", strength: "required", reason: "Significant figures and ratios need fraction fluency." },
  { concept: "Energy", requires: "Powers of a number", strength: "helpful", reason: "Energy is often expressed in powers of ten." },

  // Psychology
  { concept: "Memory models", requires: "Approaches to psychology", strength: "required", reason: "Models are compared against the approaches that produced them." },
  { concept: "Research methods", requires: "Approaches to psychology", strength: "helpful", reason: "Evidence is judged using the methods that produced it." },
  { concept: "Social influence", requires: "Research methods", strength: "helpful", reason: "Conformity studies are evaluated methodologically." },
  { concept: "Psychopathology", requires: "Approaches to psychology", strength: "required", reason: "Explanation models sit within the approaches." },
];

/** A node in the prerequisite graph. */
export type PrerequisiteNode = {
  id: string;
  name: string;
  /** True when the student has completed or mastered this topic. */
  completed: boolean;
  /** 0-100 mastery score, if known. */
  mastery?: number | null;
};

export type PrerequisiteEdge = {
  from: string; // the concept that must come first
  to: string; // the concept that depends on it
  strength: PrerequisiteStrength;
  reason: string;
};

/**
 * Match a rule's concept name to one of the student's own topics.
 * Matching is case-insensitive and allows "contains" for common variants
 * (for example "Pythagoras' theorem" matching "Pythagoras theorem").
 */
export function matchConcept(
  concept: string,
  topics: readonly PrerequisiteNode[],
): PrerequisiteNode | null {
  const normalize = (value: string) =>
    value
      .toLowerCase()
      .replace(/[’'`]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

  const target = normalize(concept);
  const exact = topics.find((topic) => normalize(topic.name) === target);
  if (exact) return exact;
  const partial = topics.find((topic) => {
    const name = normalize(topic.name);
    return name.includes(target) || target.includes(name);
  });
  return partial ?? null;
}

/**
 * Concept-level dependency graph with transitive closure.
 *
 * A student who has "Expanding brackets" and "Solving linear equations" but
 * not "Simplifying algebraic expressions" still needs the brackets before the
 * equations, so dependencies are closed transitively over the rule set.
 *
 * A path is "required" only when every step on it is required; otherwise the
 * relationship is "helpful".
 */
export function conceptDependencyClosure(
  rules: readonly PrerequisiteRule[] = PREREQUISITE_RULES,
): Map<string, Map<string, PrerequisiteStrength>> {
  const direct = new Map<string, Map<string, PrerequisiteStrength>>();
  for (const rule of rules) {
    const targets = direct.get(rule.concept) ?? new Map();
    const existing = targets.get(rule.requires);
    if (existing !== "required") targets.set(rule.requires, rule.strength);
    direct.set(rule.concept, targets);
  }

  const closure = new Map<string, Map<string, PrerequisiteStrength>>();
  for (const concept of direct.keys()) {
    const resolved = new Map<string, PrerequisiteStrength>();
    const walk = (current: string, strengths: PrerequisiteStrength[], seen: Set<string>) => {
      const targets = direct.get(current);
      if (!targets) return;
      for (const [next, strength] of targets) {
        if (seen.has(next)) continue;
        const nextStrength: PrerequisiteStrength =
          strengths.every((value) => value === "required") &&
          strength === "required"
            ? "required"
            : "helpful";
        const previous = resolved.get(next);
        if (previous !== "required") resolved.set(next, nextStrength);
        seen.add(next);
        walk(next, [...strengths, nextStrength], seen);
        seen.delete(next);
      }
    };
    walk(concept, [], new Set([concept]));
    closure.set(concept, resolved);
  }

  return closure;
}

/**
 * Build the prerequisite edges that apply to a given set of topics.
 */
export function buildPrerequisiteEdges(
  topics: readonly PrerequisiteNode[],
  rules: readonly PrerequisiteRule[] = PREREQUISITE_RULES,
): PrerequisiteEdge[] {
  const closure = conceptDependencyClosure(rules);
  const edges: PrerequisiteEdge[] = [];
  const reasons = new Map<string, string>();
  for (const rule of rules) {
    reasons.set(`${rule.concept}::${rule.requires}`, rule.reason);
  }

  for (const [concept, targets] of closure) {
    const target = matchConcept(concept, topics);
    if (!target) continue;
    for (const [requiresConcept, strength] of targets) {
      const source = matchConcept(requiresConcept, topics);
      if (!source || source.id === target.id) continue;
      const key = `${source.id}->${target.id}`;
      if (edges.some((edge) => `${edge.from}->${edge.to}` === key)) continue;
      const reason =
        reasons.get(`${concept}::${requiresConcept}`) ??
        `Learning "${requiresConcept}" first supports "${concept}".`;
      edges.push({ from: source.id, to: target.id, strength, reason });
    }
  }

  return edges;
}

/**
 * Produce a recommended learning order.
 *
 * Topics that are prerequisites of other topics come first; among topics with
 * no unmet prerequisites, the weakest mastery comes next so revision time
 * goes where it helps most.
 */
export function recommendedOrder(
  topics: readonly PrerequisiteNode[],
  edges: readonly PrerequisiteEdge[],
): PrerequisiteNode[] {
  const byId = new Map(topics.map((topic) => [topic.id, topic]));
  const incoming = new Map<string, string[]>();
  for (const edge of edges) {
    if (!byId.has(edge.from) || !byId.has(edge.to)) continue;
    const list = incoming.get(edge.to);
    if (list) list.push(edge.from);
    else incoming.set(edge.to, [edge.from]);
  }

  const remaining = new Set(topics.map((topic) => topic.id));
  const ordered: PrerequisiteNode[] = [];
  const done = new Set<string>();

  while (remaining.size) {
    // A topic is ready when every *required* prerequisite is complete.
    const ready = topics.filter((topic) => {
      if (!remaining.has(topic.id)) return false;
      const blockers = (incoming.get(topic.id) ?? []).filter(
        (from) =>
          !done.has(from) &&
          edges.find(
            (edge) => edge.from === from && edge.to === topic.id,
          )?.strength === "required",
      );
      return blockers.length === 0;
    });

    const pool = ready.length
      ? ready
      : topics.filter((topic) => remaining.has(topic.id));
    if (!pool.length) break;

    pool.sort((a, b) => {
      const aMastery = a.mastery ?? 0;
      const bMastery = b.mastery ?? 0;
      if (aMastery !== bMastery) return aMastery - bMastery;
      return a.name.localeCompare(b.name);
    });

    const next = pool[0];
    ordered.push(next);
    done.add(next.id);
    remaining.delete(next.id);
  }

  return ordered;
}

export type WeakTopic = {
  topic: PrerequisiteNode;
  /** Number of topics that depend on this one. */
  unlocks: number;
  /** Prerequisite topics that are not yet complete. */
  blockedBy: { name: string; reason: string }[];
};

/**
 * Rank topics by how much they hold the rest of the learning back.
 */
export function prioritiseTopics(
  topics: readonly PrerequisiteNode[],
  edges: readonly PrerequisiteEdge[],
): WeakTopic[] {
  const byId = new Map(topics.map((topic) => [topic.id, topic]));
  return topics
    .map((topic) => {
      const unlocks = edges.filter(
        (edge) => edge.from === topic.id && edge.strength === "required",
      ).length;
      const blockedBy = edges
        .filter((edge) => edge.to === topic.id)
        .filter((edge) => {
          const source = byId.get(edge.from);
          return source && !source.completed;
        })
        .map((edge) => ({
          name: byId.get(edge.from)?.name ?? edge.from,
          reason: edge.reason,
        }));
      return { topic, unlocks, blockedBy };
    })
    .sort((a, b) => {
      if (b.unlocks !== a.unlocks) return b.unlocks - a.unlocks;
      const aMastery = a.topic.mastery ?? 0;
      const bMastery = b.topic.mastery ?? 0;
      if (aMastery !== bMastery) return aMastery - bMastery;
      return a.topic.name.localeCompare(b.topic.name);
    });
}
