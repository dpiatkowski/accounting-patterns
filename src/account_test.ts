import { assert, assertThrows } from "assert/mod.ts";
import { Account, deposit, withdrawal } from "./account.ts";
import { DateRange } from "./dateRange.ts";
import { Money } from "./money.ts";

const currency = "PLN";

Deno.test("Empty account", () => {
  const account = new Account(currency);

  const now = Temporal.Now.instant();
  const dateRange = new DateRange(now, now);

  assert(account.balance(dateRange).equals(Money.zero(currency)));
  assert(account.deposits(dateRange).equals(Money.zero(currency)));
  assert(account.withdrawals(dateRange).equals(Money.zero(currency)));
});

Deno.test("Depositing or withdrawing 0 throws", () => {
  const account = new Account(currency);

  assertThrows(() => {
    account.addEntry(deposit(Money.zero(currency), Temporal.Now.instant()));
  });

  assertThrows(() => {
    account.addEntry(withdrawal(Money.zero(currency), Temporal.Now.instant()));
  });
});

Deno.test("Account with entry history", () => {
  const account = new Account(currency);

  const beginning = Temporal.Now.instant();

  account.addEntry(deposit(new Money(10, currency), Temporal.Now.instant()));
  account.addEntry(deposit(new Money(20, currency), Temporal.Now.instant()));

  const midpoint = Temporal.Now.instant();
  const midpointRange = new DateRange(beginning, midpoint);

  assert(account.balance(midpointRange).equals(new Money(30, currency)));
  assert(account.deposits(midpointRange).equals(new Money(30, currency)));
  assert(account.withdrawals(midpointRange).equals(Money.zero(currency)));

  account.addEntry(withdrawal(new Money(15, currency), Temporal.Now.instant()));

  const end = Temporal.Now.instant();
  const endRange = new DateRange(beginning, end);

  assert(account.balance(endRange).equals(new Money(15, currency)));
  assert(account.deposits(endRange).equals(new Money(30, currency)));
  assert(account.withdrawals(endRange).equals(new Money(-15, currency)));
});

Deno.test("Test balance using transactions", () => {
  const revenue = new Account(currency);
  const defferd = new Account(currency);
  const recivables = new Account(currency);

  const transactionDate = Temporal.Instant.from("2023-01-01T01:00:00Z");

  revenue.withdraw(new Money(500, currency), recivables, transactionDate);
  revenue.withdraw(new Money(200, currency), defferd, transactionDate);

  const dateRange = new DateRange(transactionDate, Temporal.Now.instant());
  assert(revenue.balance(dateRange).equals(new Money(-700, currency)));
  assert(defferd.balance(dateRange).equals(new Money(200, currency)));
  assert(recivables.balance(dateRange).equals(new Money(500, currency)));
});
