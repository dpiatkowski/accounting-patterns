import { type Customer } from "../customer.ts";
import { type Money } from "../money.ts";
import { AccountingEvent, type EventType } from "./mod.ts";

class MonetaryEvent extends AccountingEvent {
  constructor(
    readonly amount: Money,
    readonly type: EventType,
    readonly whenOccured: Date,
    readonly whenNoticed: Date,
    readonly customer: Customer,
  ) {
    super(type, whenOccured, whenNoticed, customer);
  }
}

export { MonetaryEvent };
