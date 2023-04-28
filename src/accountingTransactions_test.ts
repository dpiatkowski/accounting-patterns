import { assertEquals, assertThrows } from "testing/asserts.ts";
import { Account } from "./account.ts";
import {
  AccountingTransaction,
  ImmutableTransactionError,
  UnableToPostTransactionError,
} from "./accountingTransactions.ts";

Deno.test("Multi-legged transaction between 3 accounts", () => {
  const revenue = new Account("PLN");
  const recivables = new Account("PLN");
  const defferd = new Account("PLN");

  const transaction = new AccountingTransaction(new Date());
  transaction.add(-700, revenue);
  transaction.add(500, recivables);
  transaction.add(200, defferd);
  transaction.post();

  const now = new Date();
  assertEquals(revenue.balance(now), -700);
  assertEquals(recivables.balance(now), 500);
  assertEquals(defferd.balance(now), 200);
});

Deno.test("Adding entries to posted transaction fails", () => {
  const revenue = new Account("PLN");
  const recivables = new Account("PLN");

  const transaction = new AccountingTransaction(new Date());
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

  const transaction = new AccountingTransaction(new Date());
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

  const transaction = new AccountingTransaction(new Date());
  transaction.add(-500, revenue);
  transaction.add(600, recivables);

  assertThrows(() => {
    transaction.post();
  }, UnableToPostTransactionError);
});
