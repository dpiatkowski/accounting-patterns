import { type Customer } from "./customer.ts";
import { type Entry } from "./entry.ts";
import { Money } from "./money.ts";
import { type PostingRule } from "./postingRules.ts";

type EventType = "Usage" | "ServiceCall" | "Tax";

class AccountingEvent {
  readonly #resultingEntries: Entry[] = [];
  readonly #secondaryEvents: AccountingEvent[] = [];

  constructor(
    readonly type: EventType,
    readonly whenOccured: Date,
    readonly whenNoticed: Date,
    readonly customer: Customer,
  ) {
  }

  getResultingEntries(): Entry[] {
    return this.#resultingEntries;
  }

  addResultingEntry(entry: Entry): void {
    this.#resultingEntries.push(entry);
  }

  addSecondaryEvent(event: AccountingEvent): void {
    this.#secondaryEvents.push(event);
  }

  getAllResultingEntries(): Entry[] {
    const result = [...this.#resultingEntries];

    for (const event of this.#secondaryEvents) {
      for (const entry of event.getResultingEntries()) {
        result.push(entry);
      }
    }

    return result;
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

class TaxEvent extends MonetaryEvent {
  #baseEvent: AccountingEvent;

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

    this.#baseEvent = baseEvent;
    baseEvent.addSecondaryEvent(this);
  }
}

export {
  AccountingEvent,
  type EventType,
  MonetaryEvent,
  TaxEvent,
  UsageAccountingEvent,
};
