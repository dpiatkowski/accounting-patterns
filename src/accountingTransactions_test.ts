import { assertEquals, assertThrows } from "testing/asserts.ts";
import { Account } from "./account.ts";
import {
  AccountingTransaction,
  ImmutableTransactionError,
  UnableToPostTransactionError,
} from "./accountingTransactions.ts";
import { DateRange } from "./dateRange.ts";

Deno.test("Multi-legged transaction between 3 accounts", () => {
  const revenue = new Account("PLN");
  const recivables = new Account("PLN");
  const defferd = new Account("PLN");

  const transactionDate = new Date(2023, 0, 1);

  const transaction = new AccountingTransaction(transactionDate);
  transaction.add(-700, revenue);
  transaction.add(500, recivables);
  transaction.add(200, defferd);
  transaction.post();

  const dateRange = new DateRange(transactionDate, new Date());
  assertEquals(revenue.balance(dateRange), -700);
  assertEquals(recivables.balance(dateRange), 500);
  assertEquals(defferd.balance(dateRange), 200);
});

Deno.test("Adding entries to posted transaction fails", () => {
  const revenue = new Account("PLN");
  const recivables = new Account("PLN");

  const transaction = new AccountingTransaction(new Date(2023, 0, 1));
  transaction.add(-500, revenue);
  transaction.add(500, recivables);
  transaction.post();

  assertThrows(() => {
    transaction.add(100, revenue);
  }, ImmutableTransactionError);
});

Deno.test("Posting posted transaction fails", () => {
  const revenue = new Account("PLN");
  const recivables = new Account("PLN");

  const transaction = new AccountingTransaction(new Date(2023, 0, 1));
  transaction.add(-500, revenue);
  transaction.add(500, recivables);
  transaction.post();

  assertThrows(() => {
    transaction.post();
  }, UnableToPostTransactionError);
});

Deno.test("Posting unbalanced transaction fails", () => {
  const revenue = new Account("PLN");
  const recivables = new Account("PLN");

  const transaction = new AccountingTransaction(new Date(2023, 0, 1));
  transaction.add(-500, revenue);
  transaction.add(600, recivables);

  assertThrows(() => {
    transaction.post();
  }, UnableToPostTransactionError);
});
