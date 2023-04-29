import { assertEquals, assertThrows } from "testing/asserts.ts";
import { Account, deposit, withdrawal } from "./account.ts";
import { DateRange } from "./dateRange.ts";

Deno.test("Empty account", () => {
  const account = new Account("PLN");

  const now = new Date();

  assertEquals(account.balance(now), 0);
  assertEquals(account.deposits(new DateRange(now, now)), 0);
  assertEquals(account.withdrawals(new DateRange(now, now)), 0);
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

Deno.test("Test balance using transactions", () => {
  const revenue = new Account("PLN");
  const defferd = new Account("PLN");
  const recivables = new Account("PLN");

  const transactionDate = new Date(2023, 0, 1);

  revenue.withdraw(500, recivables, transactionDate);
  revenue.withdraw(200, defferd, transactionDate);

  const dateRange = new DateRange(transactionDate, new Date());
  assertEquals(revenue.balance(dateRange), -700);
  assertEquals(defferd.balance(dateRange), 200);
  assertEquals(recivables.balance(dateRange), 500);
});
