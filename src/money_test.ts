import {
  assert,
  assertEquals,
  assertFalse,
  assertThrows,
} from "testing/asserts.ts";
import { InvalidCurrencyError, Money } from "./money.ts";

Deno.test("Equality of two Money objects", () => {
  assert(new Money(10, "PLN").equals(new Money(10, "PLN")));
  assertFalse(new Money(10, "PLN").equals(new Money(10, "EUR")));
  assertFalse(new Money(10, "PLN").equals(new Money(20, "PLN")));
  assertFalse(new Money(10, "PLN").equals(new Money(20, "EUR")));
});

Deno.test("Negating value of Money object", () => {
  const currency = "PLN";
  const money = new Money(10, currency).negate();

  assertEquals(money.value, -10);
  assertEquals(money.currency, currency);
});

Deno.test("Adding two Money objects", () => {
  const currency = "PLN";
  const left = new Money(10, currency);
  const right = new Money(20, currency);

  assert(left.add(right).equals(new Money(30, currency)));

  const negatedRight = right.negate();
  assert(left.add(negatedRight).equals(new Money(-10, currency)));
});

Deno.test("Adding two Money objects with different currency fails", () => {
  assertThrows(() => {
    new Money(10, "PLN").add(new Money(10, "EUR"));
  }, InvalidCurrencyError);
});

Deno.test("Multiply Money object", () => {
  const currency = "PLN";
  const money = new Money(10, currency);

  assert(money.multiply(2).equals(new Money(20, currency)));
  assert(money.multiply(.5).equals(new Money(5, currency)));
});
