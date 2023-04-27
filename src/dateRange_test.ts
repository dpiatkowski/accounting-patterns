import { assertEquals, assertThrows } from "testing/asserts.ts";
import { DateRange } from "./dateRange.ts";

Deno.test("Point in time is valid", () => {
  const pointInTime = new Date(2023, 3, 27);
  const dateRange = new DateRange(pointInTime, pointInTime);
  assertEquals(dateRange.includes(pointInTime), true);
});

Deno.test("Proper date range", () => {
  const dateRange = new DateRange(new Date(2023, 3, 1), new Date(2023, 3, 30));
  assertEquals(dateRange.includes(new Date(2023, 3, 27)), true);
});

Deno.test("Lower bound later than upper throws", () => {
  assertThrows(() => {
    new DateRange(new Date(2022, 0, 1), new Date(2021, 0, 1));
  });
});
