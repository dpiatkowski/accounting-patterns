import { type Money } from "../money.ts";
import { type AccountingEvent, MonetaryEvent } from "./mod.ts";

class TaxEvent extends MonetaryEvent {
  constructor(baseEvent: AccountingEvent, taxableAmount: Money) {
    super(
      taxableAmount,
      "Tax",
      baseEvent.whenOccured,
      baseEvent.whenNoticed,
      baseEvent.customer,
    );

    if (baseEvent.type == this.type) {
      throw new Error("Probable endless recursion");
    }

    baseEvent.addSecondaryEvent(this);
  }
}

export { TaxEvent };
