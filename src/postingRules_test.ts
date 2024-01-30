import {
  assertArrayIncludes,
  assertEquals,
  assertExists,
  assertThrows,
} from "assert/mod.ts";
import { Customer } from "./customer.ts";
import { Entry, EntryType } from "./entry.ts";
import { MonetaryEvent, UsageAccountingEvent } from "./events/mod.ts";
import { Money } from "./money.ts";
import {
  AmmountFormulaPostingRule,
  MultiplyByRatePostingRule,
  PoolCapPostingRule,
} from "./postingRules.ts";
import { ServiceAgreement } from "./serviceAgreement.ts";

const currency = "PLN";

Deno.test("Missing rule at given date", () => {
  const serviceAgreement = new ServiceAgreement(420);

  assertThrows(() => {
    serviceAgreement.getPostingRule(
      "Usage",
      Temporal.Instant.from("2023-04-01T01:00:00Z"),
    );
  });
});

Deno.test("Multiply by rate posting rule", () => {
  const serviceAgreement = new ServiceAgreement(10);
  serviceAgreement.addPostingRule(
    "Usage",
    new MultiplyByRatePostingRule("BaseUsage"),
    Temporal.Instant.from("2023-04-01T01:00:00Z"),
  );
  serviceAgreement.addPostingRule(
    "Tax",
    new AmmountFormulaPostingRule(0.055, Money.zero(currency), "Tax"),
    Temporal.Instant.from("2023-04-01T01:00:00Z"),
  );

  const customer = new Customer("WPH", serviceAgreement);

  const event = new UsageAccountingEvent(
    new Money(50, currency),
    Temporal.Instant.from("2023-04-01T01:00:00Z"),
    Temporal.Instant.from("2023-04-01T01:00:00Z"),
    customer,
  );

  event.process();

  const [usageEntry, taxEntry] = customer.getEntries();

  assertEntry(usageEntry, "BaseUsage", 500);
  assertEntry(taxEntry, "Tax", 27.5);

  assertArrayIncludes(event.getResultingEntries(), [usageEntry]);
  assertArrayIncludes(event.getAllResultingEntries(), [taxEntry]);
});

Deno.test("Amount formula posting rule", () => {
  const serviceAgreement = new ServiceAgreement(10);
  serviceAgreement.addPostingRule(
    "Usage",
    new MultiplyByRatePostingRule("BaseUsage"),
    Temporal.Instant.from("2023-04-01T01:00:00Z"),
  );
  serviceAgreement.addPostingRule(
    "ServiceCall",
    new AmmountFormulaPostingRule(0.5, new Money(10, currency), "ServiceFee"),
    Temporal.Instant.from("2023-04-01T01:00:00Z"),
  );
  serviceAgreement.addPostingRule(
    "Tax",
    new AmmountFormulaPostingRule(0.055, Money.zero(currency), "Tax"),
    Temporal.Instant.from("2023-04-01T01:00:00Z"),
  );

  const customer = new Customer("WPH", serviceAgreement);

  const event = new MonetaryEvent(
    new Money(40, currency),
    "ServiceCall",
    Temporal.Instant.from("2023-04-01T01:00:00Z"),
    Temporal.Instant.from("2023-04-01T01:00:00Z"),
    customer,
  );

  event.process();

  const [serviceFeeEntry, taxEntry] = customer.getEntries();

  assertEntry(serviceFeeEntry, "ServiceFee", 30);
  assertEntry(taxEntry, "Tax", 1.65);
});

Deno.test("Amount formula posting rule with a change", () => {
  const serviceAgreement = new ServiceAgreement(10);
  serviceAgreement.addPostingRule(
    "Usage",
    new MultiplyByRatePostingRule("BaseUsage"),
    Temporal.Instant.from("2023-04-01T01:00:00Z"),
  );
  serviceAgreement.addPostingRule(
    "ServiceCall",
    new AmmountFormulaPostingRule(0.5, new Money(10, currency), "ServiceFee"),
    Temporal.Instant.from("2023-04-01T01:00:00Z"),
  );
  serviceAgreement.addPostingRule(
    "ServiceCall",
    new AmmountFormulaPostingRule(0.5, new Money(15, currency), "ServiceFee"),
    Temporal.Instant.from("2023-04-01T01:00:00Z"),
  );
  serviceAgreement.addPostingRule(
    "Tax",
    new AmmountFormulaPostingRule(0.055, Money.zero(currency), "Tax"),
    Temporal.Instant.from("2023-04-01T01:00:00Z"),
  );

  const customer = new Customer("WPH", serviceAgreement);

  const event = new MonetaryEvent(
    new Money(40, currency),
    "ServiceCall",
    Temporal.Instant.from("2023-04-01T01:00:00Z"),
    Temporal.Instant.from("2023-04-01T01:00:00Z"),
    customer,
  );

  event.process();

  const [resultingEntry] = customer.getEntries();
  assertEntry(resultingEntry, "ServiceFee", 35);
});

Deno.test("Amount formula posting rule with service agreement change", () => {
  const serviceAgreement = new ServiceAgreement(10);
  serviceAgreement.addPostingRule(
    "Usage",
    new PoolCapPostingRule(5, 50, "BaseUsage"),
    Temporal.Instant.from("2023-04-01T01:00:00Z"),
  );
  serviceAgreement.addPostingRule(
    "ServiceCall",
    new AmmountFormulaPostingRule(0.5, new Money(10, currency), "ServiceFee"),
    Temporal.Instant.from("2023-04-01T01:00:00Z"),
  );
  serviceAgreement.addPostingRule(
    "Tax",
    new AmmountFormulaPostingRule(0.055, Money.zero(currency), "Tax"),
    Temporal.Instant.from("2023-04-01T01:00:00Z"),
  );

  const customer = new Customer("WPH", serviceAgreement);

  const usage = new UsageAccountingEvent(
    new Money(50, currency),
    Temporal.Instant.from("2023-04-01T01:00:00Z"),
    Temporal.Instant.from("2023-04-01T01:00:00Z"),
    customer,
  );

  usage.process();

  const usage2 = new UsageAccountingEvent(
    new Money(51, currency),
    Temporal.Instant.from("2023-04-01T01:00:00Z"),
    Temporal.Instant.from("2023-04-01T01:00:00Z"),
    customer,
  );

  usage2.process();

  const [baseUsageEntry, taxEntry, baseUsageEntry2, taxEntry2] = customer
    .getEntries();

  assertEntry(baseUsageEntry, "BaseUsage", 250);
  assertEntry(taxEntry, "Tax", 13.75);
  assertEntry(baseUsageEntry2, "BaseUsage", 510);
  assertEntry(taxEntry2, "Tax", 28.05);
});

function assertEntry(
  entry: Entry | undefined,
  type: EntryType,
  amount: number,
): void {
  assertExists(entry);
  assertEquals(entry.type, type);
  assertEquals(entry.amount.value, amount);
}
