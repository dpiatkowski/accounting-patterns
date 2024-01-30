import { assertEquals, assertThrows } from "assert/mod.ts";
import { Account } from "./account.ts";
import {
  AccountingTransaction,
  ImmutableTransactionError,
  UnableToPostTransactionError,
} from "./accountingTransactions.ts";
import { DateRange } from "./dateRange.ts";
import { Money } from "./money.ts";

const currency = "PLN";

Deno.test("Posting unbalanced transaction fails", () => {
  const account = new Account(currency);

  const transaction = new AccountingTransaction(Temporal.Now.instant());
  transaction.add(new Money(500, currency), account);

  assertThrows(() => {
    transaction.post();
  }, UnableToPostTransactionError);
});

Deno.test("Multi-legged transaction between 3 accounts", () => {
  const revenue = new Account(currency);
  const recivables = new Account(currency);
  const defferd = new Account(currency);

  const transactionDate = Temporal.Instant.from("2023-01-01T01:00:00Z");

  const transaction = new AccountingTransaction(transactionDate);
  transaction.add(new Money(-700, currency), revenue);
  transaction.add(new Money(500, currency), recivables);
  transaction.add(new Money(200, currency), defferd);
  transaction.post();

  const dateRange = new DateRange(transactionDate, Temporal.Now.instant());
  assertEquals(revenue.balance(dateRange), new Money(-700, currency));
  assertEquals(recivables.balance(dateRange), new Money(500, currency));
  assertEquals(defferd.balance(dateRange), new Money(200, currency));
});

Deno.test("Adding entries to posted transaction fails", () => {
  const revenue = new Account(currency);
  const recivables = new Account(currency);

  const transaction = new AccountingTransaction(
    Temporal.Instant.from("2023-01-01T01:00:00Z"),
  );
  transaction.add(new Money(-500, currency), revenue);
  transaction.add(new Money(500, currency), recivables);
  transaction.post();

  assertThrows(() => {
    transaction.add(new Money(100, currency), revenue);
  }, ImmutableTransactionError);
});

Deno.test("Posting posted transaction fails", () => {
  const revenue = new Account(currency);
  const recivables = new Account(currency);

  const transaction = new AccountingTransaction(
    Temporal.Instant.from("2023-01-01T01:00:00Z"),
  );
  transaction.add(new Money(-500, currency), revenue);
  transaction.add(new Money(500, currency), recivables);
  transaction.post();

  assertThrows(() => {
    transaction.post();
  }, UnableToPostTransactionError);
});

Deno.test("Posting unbalanced transaction fails", () => {
  const revenue = new Account(currency);
  const recivables = new Account(currency);

  const transaction = new AccountingTransaction(
    Temporal.Instant.from("2023-01-01T01:00:00Z"),
  );
  transaction.add(new Money(-500, currency), revenue);
  transaction.add(new Money(600, currency), recivables);

  assertThrows(() => {
    transaction.post();
  }, UnableToPostTransactionError);
});
