import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PREREQUISITE_RULES,
  buildPrerequisiteEdges,
  matchConcept,
  prioritiseTopics,
  recommendedOrder,
  type PrerequisiteNode,
} from "../lib/prerequisites";

const nodes: PrerequisiteNode[] = [
  { id: "t1", name: "Multiplication tables", completed: true },
  { id: "t2", name: "Expanding brackets", completed: false },
  { id: "t3", name: "Solving linear equations", completed: false },
  { id: "t4", name: "Quadratic equations", completed: false },
  { id: "t5", name: "Enzymes", completed: false },
  { id: "t6", name: "Photosynthesis", completed: false },
];

test("the rule set is internally consistent", () => {
  assert.ok(PREREQUISITE_RULES.length > 40);
  for (const rule of PREREQUISITE_RULES) {
    assert.ok(rule.concept.length > 2, rule.concept);
    assert.ok(rule.requires.length > 2, rule.requires);
    assert.notEqual(rule.concept, rule.requires);
    assert.ok(rule.reason.length > 10, rule.concept);
    assert.ok(["required", "helpful"].includes(rule.strength));
  }
});

test("concepts match topics regardless of case and punctuation", () => {
  assert.equal(matchConcept("pythagoras' theorem", [
    { id: "p", name: "Pythagoras theorem", completed: false },
  ])?.id, "p");
  assert.equal(matchConcept("Enzymes", [
    { id: "e", name: "ENZYMES", completed: false },
  ])?.id, "e");
  assert.equal(matchConcept("Quantum chromodynamics", [
    { id: "e", name: "Enzymes", completed: false },
  ]), null);
});

test("edges are built only between topics the student actually has", () => {
  const edges = buildPrerequisiteEdges(nodes);
  const pairs = edges.map((edge) => `${edge.from}->${edge.to}`);
  assert.ok(pairs.includes("t1->t2"), pairs.join(", "));
  assert.ok(pairs.includes("t2->t3"));
  assert.ok(pairs.includes("t3->t4"));
  assert.ok(pairs.includes("t5->t6"));
});

test("dependencies are closed transitively", () => {
  const edges = buildPrerequisiteEdges(nodes);
  const pairs = edges.map((edge) => `${edge.from}->${edge.to}`);
  // Multiplying tables underpin solving equations through expanding brackets.
  assert.ok(pairs.includes("t1->t3"), pairs.join(", "));
  assert.ok(pairs.includes("t1->t4"), pairs.join(", "));
});

test("edges are de-duplicated", () => {
  const edges = buildPrerequisiteEdges(nodes);
  const keys = edges.map((edge) => `${edge.from}->${edge.to}`);
  assert.equal(new Set(keys).size, keys.length);
});

test("the recommended order puts prerequisites first", () => {
  const edges = buildPrerequisiteEdges(nodes);
  const order = recommendedOrder(nodes, edges).map((node) => node.id);
  assert.ok(order.indexOf("t1") < order.indexOf("t2"));
  assert.ok(order.indexOf("t2") < order.indexOf("t3"));
  assert.ok(order.indexOf("t3") < order.indexOf("t4"));
  assert.ok(order.indexOf("t5") < order.indexOf("t6"));
});

test("the recommended order includes every topic exactly once", () => {
  const edges = buildPrerequisiteEdges(nodes);
  const order = recommendedOrder(nodes, edges);
  assert.equal(order.length, nodes.length);
  assert.equal(new Set(order.map((node) => node.id)).size, nodes.length);
});

test("weakest mastery is revised first among ready topics", () => {
  const withMastery: PrerequisiteNode[] = [
    { id: "a", name: "Alpha", completed: false, mastery: 20 },
    { id: "b", name: "Beta", completed: false, mastery: 80 },
  ];
  const order = recommendedOrder(withMastery, []);
  assert.deepEqual(order.map((node) => node.id), ["a", "b"]);
});

test("completed prerequisites unblock dependent topics", () => {
  const allDone: PrerequisiteNode[] = nodes.map((node) => ({
    ...node,
    completed: true,
  }));
  const edges = buildPrerequisiteEdges(allDone);
  const order = recommendedOrder(allDone, edges);
  assert.equal(order.length, allDone.length);
});

test("prioritisation ranks topics that unlock the most learning", () => {
  const edges = buildPrerequisiteEdges(nodes);
  const priorities = prioritiseTopics(nodes, edges);
  const expansions = priorities.find((entry) => entry.topic.id === "t2");
  assert.ok(expansions);
  assert.ok(expansions.unlocks >= 1);
  assert.ok(expansions.blockedBy.length >= 0);
});

test("blocked-by lists prerequisites that are not yet complete", () => {
  const edges = buildPrerequisiteEdges(nodes);
  const priorities = prioritiseTopics(nodes, edges);
  const quadratic = priorities.find((entry) => entry.topic.id === "t4");
  assert.ok(quadratic);
  assert.ok(
    quadratic.blockedBy.some((entry) => entry.name === "Solving linear equations"),
  );
});
