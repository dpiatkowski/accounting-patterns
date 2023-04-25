import { type Customer } from "./customer.ts";
import { type Entry } from "./entry.ts";
import { Money } from "./money.ts";
import { type PostingRule } from "./postingRules.ts";

type EventType = "Usage" | "ServiceCall";

class AccountingEvent {
  readonly #resultingEntries: Entry[] = [];

  constructor(
    readonly type: EventType,
    readonly whenOccured: Date,
    readonly whenNoticed: Date,
    readonly customer: Customer,
  ) {
  }

  addResultingEntry(entry: Entry): void {
    this.#resultingEntries.push(entry);
  }

  process(): void {
    this.#findRule().process(this);
  }

  #findRule(): PostingRule {
    const rule = this.customer.serviceAgreement.getPostingRule(
      this.type,
      this.whenOccured,
    );

    if (!rule) {
      throw new Error("Missing posting rule");
    }

    return rule;
  }
}

class UsageAccountingEvent extends AccountingEvent {
  constructor(
    readonly amount: number,
    readonly whenOccured: Date,
    readonly whenNoticed: Date,
    readonly customer: Customer,
  ) {
    super("Usage", whenOccured, whenNoticed, customer);
  }

  get rate(): number {
    return this.customer.serviceAgreement.rate;
  }
}

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

export { AccountingEvent, type EventType, MonetaryEvent, UsageAccountingEvent };
