import { assertEquals, assertThrows } from "testing/asserts.ts";
import { Account } from "./account.ts";
import {
  AccountingTransaction,
  ImmutableTransactionError,
  UnableToPostTransactionError,
} from "./accountingTransactions.ts";
import { DateRange } from "./dateRange.ts";
import { Money } from "./money.ts";

const currency = "PLN";

Deno.test("Multi-legged transaction between 3 accounts", () => {
  const revenue = new Account(currency);
  const recivables = new Account(currency);
  const defferd = new Account(currency);

  const transactionDate = new Date(2023, 0, 1);

  const transaction = new AccountingTransaction(transactionDate);
  transaction.add(new Money(-700, currency), revenue);
  transaction.add(new Money(500, currency), recivables);
  transaction.add(new Money(200, currency), defferd);
  transaction.post();

  const dateRange = new DateRange(transactionDate, new Date());
  assertEquals(revenue.balance(dateRange), new Money(-700, currency));
  assertEquals(recivables.balance(dateRange), new Money(500, currency));
  assertEquals(defferd.balance(dateRange), new Money(200, currency));
});

Deno.test("Adding entries to posted transaction fails", () => {
  const revenue = new Account(currency);
  const recivables = new Account(currency);

  const transaction = new AccountingTransaction(new Date(2023, 0, 1));
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

  const transaction = new AccountingTransaction(new Date(2023, 0, 1));
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

  const transaction = new AccountingTransaction(new Date(2023, 0, 1));
  transaction.add(new Money(-500, currency), revenue);
  transaction.add(new Money(600, currency), recivables);

  assertThrows(() => {
    transaction.post();
  }, UnableToPostTransactionError);
});
