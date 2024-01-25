import { type Customer } from "../customer.ts";
import { type Money } from "../money.ts";
import { AccountingEvent } from "./mod.ts";

class UsageAccountingEvent extends AccountingEvent {
  constructor(
    readonly amount: Money,
    readonly whenOccured: Temporal.Instant,
    readonly whenNoticed: Temporal.Instant,
    readonly customer: Customer,
  ) {
    super("Usage", whenOccured, whenNoticed, customer);
  }

  get rate(): number {
    return this.customer.serviceAgreement.rate;
  }
}

export { UsageAccountingEvent };
