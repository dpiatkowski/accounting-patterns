import {
  assertArrayIncludes,
  assertEquals,
  assertExists,
} from "testing/asserts.ts";
import { Customer } from "./customer.ts";
import { Entry, EntryType } from "./entry.ts";
import { MonetaryEvent, UsageAccountingEvent } from "./events.ts";
import {
  AmmountFormulaPostingRule,
  MultiplyByRatePostingRule,
  PoolCapPostingRule,
} from "./postingRules.ts";
import { ServiceAgreement } from "./serviceAgreement.ts";

Deno.test("Multiply by rate posting rule", () => {
  const serviceAgreement = new ServiceAgreement(10);
  serviceAgreement.addPostingRule(
    "Usage",
    new MultiplyByRatePostingRule("BaseUsage"),
    new Date(2023, 3, 1),
  );
  serviceAgreement.addPostingRule(
    "Tax",
    new AmmountFormulaPostingRule(.055, 0, "Tax"),
    new Date(2023, 3, 1),
  );

  const customer = new Customer("WPH", serviceAgreement);

  const event = new UsageAccountingEvent(
    50,
    new Date(2023, 3, 1),
    new Date(2023, 3, 1),
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
    new Date(2023, 3, 1),
  );
  serviceAgreement.addPostingRule(
    "ServiceCall",
    new AmmountFormulaPostingRule(.5, 10, "ServiceFee"),
    new Date(2023, 3, 1),
  );
  serviceAgreement.addPostingRule(
    "Tax",
    new AmmountFormulaPostingRule(.055, 0, "Tax"),
    new Date(2023, 3, 1),
  );

  const customer = new Customer("WPH", serviceAgreement);

  const event = new MonetaryEvent(
    40,
    "ServiceCall",
    new Date(2023, 3, 1),
    new Date(2023, 3, 1),
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
    new Date(2023, 3, 1),
  );
  serviceAgreement.addPostingRule(
    "ServiceCall",
    new AmmountFormulaPostingRule(.5, 10, "ServiceFee"),
    new Date(2023, 1, 1),
  );
  serviceAgreement.addPostingRule(
    "ServiceCall",
    new AmmountFormulaPostingRule(.5, 15, "ServiceFee"),
    new Date(2023, 2, 1),
  );
  serviceAgreement.addPostingRule(
    "Tax",
    new AmmountFormulaPostingRule(.055, 0, "Tax"),
    new Date(2023, 3, 1),
  );

  const customer = new Customer("WPH", serviceAgreement);

  const event = new MonetaryEvent(
    40,
    "ServiceCall",
    new Date(2023, 3, 1),
    new Date(2023, 3, 1),
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
    new Date(2023, 3, 1),
  );
  serviceAgreement.addPostingRule(
    "ServiceCall",
    new AmmountFormulaPostingRule(.5, 10, "ServiceFee"),
    new Date(2023, 3, 1),
  );
  serviceAgreement.addPostingRule(
    "Tax",
    new AmmountFormulaPostingRule(.055, 0, "Tax"),
    new Date(2023, 3, 1),
  );

  const customer = new Customer("WPH", serviceAgreement);

  const usage = new UsageAccountingEvent(
    50,
    new Date(2023, 3, 1),
    new Date(2023, 3, 1),
    customer,
  );

  usage.process();

  const usage2 = new UsageAccountingEvent(
    51,
    new Date(2023, 3, 1),
    new Date(2023, 3, 1),
    customer,
  );

  usage2.process();

  const [
    baseUsageEntry,
    taxEntry,
    baseUsageEntry2,
    taxEntry2,
  ] = customer.getEntries();

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
  assertEquals(entry.amount, amount);
}
