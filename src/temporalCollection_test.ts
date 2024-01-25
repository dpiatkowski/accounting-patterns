import { assertEquals } from "assert/mod.ts";
import { SingleTemporalCollection } from "./temporalCollection.ts";

Deno.test("Empty SingleTemporalCollection", () => {
  const collection = new SingleTemporalCollection<string>();

  assertEquals(
    collection.get(Temporal.Instant.from("2023-04-02T01:00:00Z")),
    undefined,
  );
});

Deno.test("Single entry in SingleTemporalCollection", () => {
  const collection = new SingleTemporalCollection<string>();

  collection.put(Temporal.Instant.from("2023-04-03T01:00:00Z"), "CPC");

  assertEquals(
    collection.get(Temporal.Instant.from("2023-04-02T01:00:00Z")),
    undefined,
  );
  assertEquals(
    collection.get(Temporal.Instant.from("2023-04-03T01:00:00Z")),
    "CPC",
  );
  assertEquals(
    collection.get(Temporal.Instant.from("2023-04-04T01:00:00Z")),
    "CPC",
  );
});

Deno.test("Multiple entries in SingleTemporalCollection", () => {
  const collection = new SingleTemporalCollection<string>();

  collection.put(Temporal.Instant.from("2023-01-01T01:00:00Z"), "CPS");
  collection.put(Temporal.Instant.from("2023-04-01T01:00:00Z"), "CPC");

  assertEquals(
    collection.get(Temporal.Instant.from("2023-01-02T01:00:00Z")),
    "CPS",
  );
  assertEquals(
    collection.get(Temporal.Instant.from("2023-04-04T01:00:00Z")),
    "CPC",
  );
});
