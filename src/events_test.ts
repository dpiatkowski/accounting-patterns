import { assertThrows } from "@std/assert";
import { Customer } from "./customer.ts";
import { TaxEvent, UsageAccountingEvent } from "./events.ts";
import { Money } from "./money.ts";
import {
  AmmountFormulaPostingRule,
  MultiplyByRatePostingRule,
} from "./postingRules.ts";
import { ServiceAgreement } from "./serviceAgreement.ts";

Deno.test("Cannot taxate tax event", () => {
  const currency = "PLN";
  const currentTime = Temporal.Now.instant();

  const baseEvent = new UsageAccountingEvent(
    new Money(500, currency),
    currentTime,
    currentTime,
    new Customer("John", new ServiceAgreement(420)),
  );

  const taxEvent = new TaxEvent(baseEvent, new Money(10, currency));

  assertThrows(() => {
    new TaxEvent(taxEvent, new Money(10, currency));
  });
});

Deno.test("Cannot process event without rule in service agreement", () => {
  const currency = "PLN";
  const currentTime = Temporal.Now.instant();
  const serviceAgreement = new ServiceAgreement(420);

  const event = new UsageAccountingEvent(
    new Money(500, currency),
    currentTime,
    currentTime,
    new Customer("John", serviceAgreement),
  );

  assertThrows(() => {
    event.process();
  });
});

Deno.test("Cannot process event twice", () => {
  const currency = "PLN";
  const currentTime = Temporal.Now.instant();

  const serviceAgreement = new ServiceAgreement(420);
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

  const event = new UsageAccountingEvent(
    new Money(500, currency),
    currentTime,
    currentTime,
    new Customer("John", serviceAgreement),
  );

  event.process();

  assertThrows(() => {
    event.process();
  });
});
