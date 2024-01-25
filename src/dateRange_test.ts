import { assert, assertThrows } from "assert/mod.ts";
import { DateRange } from "./dateRange.ts";

Deno.test("Point in time is valid", () => {
  const pointInTime = Temporal.Instant.from("2023-03-15T01:00:00Z");
  const dateRange = new DateRange(pointInTime, pointInTime);
  assert(dateRange.includes(pointInTime));
});

Deno.test("Proper date range", () => {
  const dateRange = new DateRange(
    Temporal.Instant.from("2023-03-01T01:00:00Z"),
    Temporal.Instant.from("2023-03-30T01:00:00Z"),
  );
  assert(dateRange.includes(Temporal.Instant.from("2023-03-15T01:00:00Z")));
});

Deno.test("Lower bound later than upper throws", () => {
  assertThrows(() => {
    new DateRange(
      Temporal.Instant.from("2023-03-15T01:00:00Z"),
      Temporal.Instant.from("2023-03-01T01:00:00Z"),
    );
  });
});
