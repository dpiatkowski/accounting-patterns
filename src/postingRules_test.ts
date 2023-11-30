import { assertArrayIncludes, assertEquals, assertExists } from "assert/mod.ts";
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

Deno.test("Multiply by rate posting rule", () => {
  const serviceAgreement = new ServiceAgreement(10);
  serviceAgreement.addPostingRule(
    "Usage",
    new MultiplyByRatePostingRule("BaseUsage"),
    new Date(2023, 3, 1)
  );
  serviceAgreement.addPostingRule(
    "Tax",
    new AmmountFormulaPostingRule(0.055, Money.zero(currency), "Tax"),
    new Date(2023, 3, 1)
  );

  const customer = new Customer("WPH", serviceAgreement);

  const event = new UsageAccountingEvent(
    new Money(50, currency),
    new Date(2023, 3, 1),
    new Date(2023, 3, 1),
    customer
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
    new Date(2023, 3, 1)
  );
  serviceAgreement.addPostingRule(
    "ServiceCall",
    new AmmountFormulaPostingRule(0.5, new Money(10, currency), "ServiceFee"),
    new Date(2023, 3, 1)
  );
  serviceAgreement.addPostingRule(
    "Tax",
    new AmmountFormulaPostingRule(0.055, Money.zero(currency), "Tax"),
    new Date(2023, 3, 1)
  );

  const customer = new Customer("WPH", serviceAgreement);

  const event = new MonetaryEvent(
    new Money(40, currency),
    "ServiceCall",
    new Date(2023, 3, 1),
    new Date(2023, 3, 1),
    customer
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
    new Date(2023, 3, 1)
  );
  serviceAgreement.addPostingRule(
    "ServiceCall",
    new AmmountFormulaPostingRule(0.5, new Money(10, currency), "ServiceFee"),
    new Date(2023, 1, 1)
  );
  serviceAgreement.addPostingRule(
    "ServiceCall",
    new AmmountFormulaPostingRule(0.5, new Money(15, currency), "ServiceFee"),
    new Date(2023, 2, 1)
  );
  serviceAgreement.addPostingRule(
    "Tax",
    new AmmountFormulaPostingRule(0.055, Money.zero(currency), "Tax"),
    new Date(2023, 3, 1)
  );

  const customer = new Customer("WPH", serviceAgreement);

  const event = new MonetaryEvent(
    new Money(40, currency),
    "ServiceCall",
    new Date(2023, 3, 1),
    new Date(2023, 3, 1),
    customer
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
    new Date(2023, 3, 1)
  );
  serviceAgreement.addPostingRule(
    "ServiceCall",
    new AmmountFormulaPostingRule(0.5, new Money(10, currency), "ServiceFee"),
    new Date(2023, 3, 1)
  );
  serviceAgreement.addPostingRule(
    "Tax",
    new AmmountFormulaPostingRule(0.055, Money.zero(currency), "Tax"),
    new Date(2023, 3, 1)
  );

  const customer = new Customer("WPH", serviceAgreement);

  const usage = new UsageAccountingEvent(
    new Money(50, currency),
    new Date(2023, 3, 1),
    new Date(2023, 3, 1),
    customer
  );

  usage.process();

  const usage2 = new UsageAccountingEvent(
    new Money(51, currency),
    new Date(2023, 3, 1),
    new Date(2023, 3, 1),
    customer
  );

  usage2.process();

  const [baseUsageEntry, taxEntry, baseUsageEntry2, taxEntry2] =
    customer.getEntries();

  assertEntry(baseUsageEntry, "BaseUsage", 250);
  assertEntry(taxEntry, "Tax", 13.75);
  assertEntry(baseUsageEntry2, "BaseUsage", 510);
  assertEntry(taxEntry2, "Tax", 28.05);
});

function assertEntry(
  entry: Entry | undefined,
  type: EntryType,
  amount: number
): void {
  assertExists(entry);
  assertEquals(entry.type, type);
  assertEquals(entry.amount.value, amount);
}
