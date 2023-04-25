import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { SingleTemporalCollection } from "./temporalCollection.ts";

Deno.test("Empty SingleTemporalCollection", () => {
  const collection = new SingleTemporalCollection<string>();

  assertEquals(collection.get(new Date(2023, 5, 2)), undefined);
});

Deno.test("Single entry in SingleTemporalCollection", () => {
  const collection = new SingleTemporalCollection<string>();

  collection.put(new Date(2023, 5, 3), "CPC");

  assertEquals(collection.get(new Date(2023, 5, 2)), undefined);
  assertEquals(collection.get(new Date(2023, 5, 3)), "CPC");
  assertEquals(collection.get(new Date(2023, 5, 4)), "CPC");
});

Deno.test("Multiple entries in SingleTemporalCollection", () => {
  const collection = new SingleTemporalCollection<string>();

  collection.put(new Date(2022, 0, 1), "CPS");
  collection.put(new Date(2023, 5, 1), "CPC");

  assertEquals(collection.get(new Date(2023, 0, 1)), "CPS");
  assertEquals(collection.get(new Date(2023, 5, 4)), "CPC");
});
