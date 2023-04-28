import { assertEquals, assertThrows } from "testing/asserts.ts";
import { Account, deposit, withdrawal } from "./account.ts";
import { DateRange } from "./dateRange.ts";

Deno.test("Empty account", () => {
  const account = new Account("PLN");

  assertEquals(account.balance(new Date()), 0);
  assertEquals(account.deposits(new DateRange(new Date(), new Date())), 0);
  assertEquals(account.withdrawals(new DateRange(new Date(), new Date())), 0);
});

Deno.test("Depositing or withdrawing 0 throws", () => {
  const account = new Account("PLN");

  assertThrows(() => {
    account.addEntry(deposit(0, new Date()));
  });

  assertThrows(() => {
    account.addEntry(withdrawal(0, new Date()));
  });
});

Deno.test("Account with entry history", () => {
  const account = new Account("PLN");

  const beginning = new Date();

  account.addEntry(deposit(10, new Date()));
  account.addEntry(deposit(20, new Date()));

  const midpoint = new Date();

  assertEquals(account.balance(new Date()), 30);
  assertEquals(account.deposits(new DateRange(beginning, midpoint)), 30);
  assertEquals(account.withdrawals(new DateRange(beginning, midpoint)), 0);

  account.addEntry(withdrawal(15, new Date()));

  const end = new Date();

  assertEquals(account.balance(new Date()), 15);
  assertEquals(account.deposits(new DateRange(beginning, end)), 30);
  assertEquals(account.withdrawals(new DateRange(beginning, end)), -15);
});
