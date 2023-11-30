import { assert, assertThrows } from "assert/mod.ts";
import { Account, deposit, withdrawal } from "./account.ts";
import { DateRange } from "./dateRange.ts";
import { Money } from "./money.ts";

const currency = "PLN";

Deno.test("Empty account", () => {
  const account = new Account(currency);

  const now = new Date();
  const dateRange = new DateRange(now, now);

  assert(account.balance(dateRange).equals(Money.zero(currency)));
  assert(account.deposits(dateRange).equals(Money.zero(currency)));
  assert(account.withdrawals(dateRange).equals(Money.zero(currency)));
});

Deno.test("Depositing or withdrawing 0 throws", () => {
  const account = new Account(currency);

  assertThrows(() => {
    account.addEntry(deposit(Money.zero(currency), new Date()));
  });

  assertThrows(() => {
    account.addEntry(withdrawal(Money.zero(currency), new Date()));
  });
});

Deno.test("Account with entry history", () => {
  const account = new Account(currency);

  const beginning = new Date();

  account.addEntry(deposit(new Money(10, currency), new Date()));
  account.addEntry(deposit(new Money(20, currency), new Date()));

  const midpoint = new Date();
  const midpointRange = new DateRange(beginning, midpoint);

  assert(account.balance(midpointRange).equals(new Money(30, currency)));
  assert(account.deposits(midpointRange).equals(new Money(30, currency)));
  assert(account.withdrawals(midpointRange).equals(Money.zero(currency)));

  account.addEntry(withdrawal(new Money(15, currency), new Date()));

  const end = new Date();
  const endRange = new DateRange(beginning, end);

  assert(account.balance(new Date()).equals(new Money(15, currency)));
  assert(account.deposits(endRange).equals(new Money(30, currency)));
  assert(account.withdrawals(endRange).equals(new Money(-15, currency)));
});

Deno.test("Test balance using transactions", () => {
  const revenue = new Account(currency);
  const defferd = new Account(currency);
  const recivables = new Account(currency);

  const transactionDate = new Date(2023, 0, 1);

  revenue.withdraw(new Money(500, currency), recivables, transactionDate);
  revenue.withdraw(new Money(200, currency), defferd, transactionDate);

  const dateRange = new DateRange(transactionDate, new Date());
  assert(revenue.balance(dateRange).equals(new Money(-700, currency)));
  assert(defferd.balance(dateRange).equals(new Money(200, currency)));
  assert(recivables.balance(dateRange).equals(new Money(500, currency)));
});
