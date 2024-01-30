import { assertThrows } from "assert/mod.ts";
import { Customer } from "../customer.ts";
import { Money } from "../money.ts";
import { ServiceAgreement } from "../serviceAgreement.ts";
import { TaxEvent, UsageAccountingEvent } from "./mod.ts";

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
