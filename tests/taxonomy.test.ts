import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SUBJECT_FAMILIES,
  SUBJECT_PROFILES,
  TAXONOMY_LEVELS,
  buildTaxonomyTree,
  flattenTaxonomy,
  getSubjectProfile,
  isSubjectFamily,
  resolveSubjectFamily,
  taxonomyAncestors,
  taxonomyPath,
  taxonomySlug,
  recommendedNextTopic,
  type TaxonomyNode,
} from "../lib/taxonomy";

const nodes: TaxonomyNode[] = [
  { id: "bio", name: "Biology", level: "subject", parentId: null, sortOrder: 1 },
  { id: "exchange", name: "Exchange surfaces", level: "unit", parentId: "bio", sortOrder: 1 },
  { id: "lungs", name: "Gas exchange", level: "chapter", parentId: "exchange", sortOrder: 1 },
  { id: "fick", name: "Fick's law", level: "topic", parentId: "lungs", sortOrder: 1 },
  { id: "transport", name: "Transport in plants", level: "unit", parentId: "bio", sortOrder: 2 },
  { id: "xylem", name: "Xylem", level: "topic", parentId: "transport", sortOrder: 1 },
];

test("taxonomy levels are ordered subject → unit → chapter → topic", () => {
  assert.deepEqual([...TAXONOMY_LEVELS], ["subject", "unit", "chapter", "topic"]);
});

test("every subject family has a profile with a sector", () => {
  for (const family of SUBJECT_FAMILIES) {
    const profile = getSubjectProfile(family);
    assert.ok(profile, family);
    assert.equal(profile.family, family);
    assert.ok(profile.offeredAt.length > 0, family);
    assert.ok(profile.recommendedMinutesPerWeek > 0, family);
  }
  assert.equal(Object.keys(SUBJECT_PROFILES).length, SUBJECT_FAMILIES.length);
});

test("subject family guards and resolution work", () => {
  assert.equal(isSubjectFamily("Biology"), true);
  assert.equal(isSubjectFamily("Astrophysics"), false);
  assert.equal(resolveSubjectFamily("biology"), "Biology");
  assert.equal(resolveSubjectFamily("A-level Mathematics"), "Mathematics");
  assert.equal(resolveSubjectFamily("Computer Science"), "Computer Science");
  assert.equal(resolveSubjectFamily("Astrophysics"), null);
  assert.equal(resolveSubjectFamily(""), null);
});

test("tree indexes parents, children and depth", () => {
  const tree = buildTaxonomyTree(nodes);
  assert.deepEqual(tree.roots, ["bio"]);
  assert.deepEqual(tree.childrenByParent["bio"], ["exchange", "transport"]);
  assert.equal(tree.depthById["bio"], 0);
  assert.equal(tree.depthById["exchange"], 1);
  assert.equal(tree.depthById["lungs"], 2);
  assert.equal(tree.depthById["fick"], 3);
});

test("flattening produces a depth-first ordered list", () => {
  const flat = flattenTaxonomy(buildTaxonomyTree(nodes));
  assert.deepEqual(
    flat.map((n) => n.id),
    ["bio", "exchange", "lungs", "fick", "transport", "xylem"],
  );
});

test("siblings are ordered by sortOrder then name", () => {
  const unordered: TaxonomyNode[] = [
    { id: "root", name: "Root", level: "subject", parentId: null, sortOrder: 0 },
    { id: "b", name: "Beta", level: "unit", parentId: "root", sortOrder: 2 },
    { id: "a", name: "Alpha", level: "unit", parentId: "root", sortOrder: 2 },
    { id: "c", name: "Gamma", level: "unit", parentId: "root", sortOrder: 1 },
  ];
  const tree = buildTaxonomyTree(unordered);
  assert.deepEqual(tree.childrenByParent["root"], ["c", "a", "b"]);
});

test("orphaned nodes are treated as roots rather than disappearing", () => {
  const orphaned: TaxonomyNode[] = [
    { id: "child", name: "Child", level: "topic", parentId: "missing", sortOrder: 0 },
  ];
  const tree = buildTaxonomyTree(orphaned);
  assert.deepEqual(tree.roots, ["child"]);
  assert.equal(tree.depthById["child"], 0);
});

test("self-parenting nodes cannot create infinite depth", () => {
  const looping: TaxonomyNode[] = [
    { id: "a", name: "A", level: "topic", parentId: "a", sortOrder: 0 },
  ];
  const tree = buildTaxonomyTree(looping);
  assert.deepEqual(tree.roots, ["a"]);
  assert.equal(tree.depthById["a"], 0);
});

test("ancestors and breadcrumb paths are correct", () => {
  const tree = buildTaxonomyTree(nodes);
  assert.deepEqual(
    taxonomyAncestors(tree, "fick").map((n) => n.name),
    ["Biology", "Exchange surfaces", "Gas exchange"],
  );
  assert.equal(
    taxonomyPath(tree, "fick"),
    "Biology › Exchange surfaces › Gas exchange › Fick's law",
  );
  assert.equal(taxonomyPath(tree, "unknown"), "");
});

test("slugs are stable and filesystem safe", () => {
  assert.equal(
    taxonomySlug("Biology", "Exchange surfaces", "Fick's law"),
    "biology.exchange-surfaces.fick-s-law",
  );
  assert.equal(taxonomySlug("A-level Biology"), "a-level-biology");
});

test("recommendedNextTopic returns the first ready uncompleted topic", () => {
  const tree = buildTaxonomyTree(nodes);
  // Nothing complete: the root subject isn't a topic, so the first topic-level
  // node whose ancestors are complete. "fick" ancestors: bio, exchange, lungs
  // none complete -> not ready. "xylem" ancestors: bio, transport -> not ready.
  // No topic is ready until its ancestors are done.
  assert.equal(recommendedNextTopic(tree, {}), null);

  // Complete the chain down to "lungs": then "fick" becomes ready.
  const afterLungs = {
    bio: true,
    exchange: true,
    lungs: true,
  };
  assert.equal(recommendedNextTopic(tree, afterLungs)?.id, "fick");

  // Complete "fick" too: "xylem" becomes ready (transport isn't complete, so
  // xylem still not ready unless transport done). Actually xylem's parent is
  // transport which isn't complete -> null.
  const afterFick = { ...afterLungs, fick: true };
  assert.equal(recommendedNextTopic(tree, afterFick), null);

  const allDone = { ...afterFick, transport: true, xylem: true };
  assert.equal(recommendedNextTopic(tree, allDone), null);
});

test("recommendedNextTopic accepts a Map of completion state", () => {
  const tree = buildTaxonomyTree(nodes);
  const completed = new Map<string, boolean>([
    ["bio", true],
    ["exchange", true],
    ["lungs", true],
  ]);
  assert.equal(recommendedNextTopic(tree, completed)?.id, "fick");
});
