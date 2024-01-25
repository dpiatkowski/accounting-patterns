import { type Customer } from "../customer.ts";
import { type Money } from "../money.ts";
import { AccountingEvent, type EventType } from "./mod.ts";

class MonetaryEvent extends AccountingEvent {
  constructor(
    readonly amount: Money,
    readonly type: EventType,
    readonly whenOccured: Temporal.Instant,
    readonly whenNoticed: Temporal.Instant,
    readonly customer: Customer,
  ) {
    super(type, whenOccured, whenNoticed, customer);
  }
}

export { MonetaryEvent };
