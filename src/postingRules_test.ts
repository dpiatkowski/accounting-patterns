import { assertEquals } from "testing/asserts.ts";
import { Customer } from "./customer.ts";
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

  const customer = new Customer("WPH", serviceAgreement);

  const usage = new UsageAccountingEvent(
    50,
    new Date(2023, 3, 1),
    new Date(2023, 3, 1),
    customer,
  );

  usage.process();

  const resultingEntry = customer.getEntries().at(0);
  assertEquals(resultingEntry?.amount, 500);
  assertEquals(resultingEntry?.type, "BaseUsage");
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

  const customer = new Customer("WPH", serviceAgreement);

  const event = new MonetaryEvent(
    40,
    "ServiceCall",
    new Date(2023, 3, 1),
    new Date(2023, 3, 1),
    customer,
  );

  event.process();
  const resultingEntry = customer.getEntries().at(0);
  assertEquals(resultingEntry?.amount, 30);
  assertEquals(resultingEntry?.type, "ServiceFee");
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

  const customer = new Customer("WPH", serviceAgreement);

  const event = new MonetaryEvent(
    40,
    "ServiceCall",
    new Date(2023, 3, 1),
    new Date(2023, 3, 1),
    customer,
  );

  event.process();
  const resultingEntry = customer.getEntries().at(0);
  assertEquals(resultingEntry?.amount, 35);
  assertEquals(resultingEntry?.type, "ServiceFee");
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

  const resultingEntry = customer.getEntries().at(0);
  assertEquals(resultingEntry?.amount, 250);
  assertEquals(resultingEntry?.type, "BaseUsage");

  const resultingEntry2 = customer.getEntries().at(1);
  assertEquals(resultingEntry2?.amount, 510);
  assertEquals(resultingEntry2?.type, "BaseUsage");
});
