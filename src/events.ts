import { Customer } from "./customer.ts";
import { Entry } from "./entry.ts";
import { Money } from "./money.ts";
import { PostingRule } from "./postingRules.ts";

type EventType = "Usage" | "ServiceCall" | "Tax" | "Adjustment";

class AccountingEvent {
  readonly #resultingEntries: Entry[] = [];
  readonly #secondaryEvents: AccountingEvent[] = [];
  #isProcessed = false;
  #adjustedEvent: AccountingEvent | undefined;
  #replacementEvent: AccountingEvent | null = null;

  constructor(
    readonly type: EventType,
    readonly whenOccured: Temporal.Instant,
    readonly whenNoticed: Temporal.Instant,
    readonly customer: Customer,
    readonly adjustedEvent?: AccountingEvent,
  ) {
    if (adjustedEvent) {
      this.#adjustedEvent = adjustedEvent;
      adjustedEvent.#replacementEvent = this;
    }
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
    if (this.#isProcessed) {
      throw new Error("Cannot process an event twice");
    }

    if (this.#adjustedEvent) {
      this.#adjustedEvent.reverse();
    }

    this.#findRule().process(this);
    this.#isProcessed = true;
  }

  reverse(): void {
    for (const entry of this.getResultingEntries()) {
      const reversingEntry = {
        amount: entry.amount.negate(),
        date: entry.date,
        type: entry.type,
      };

      this.customer.addEntry(reversingEntry);
      this.addResultingEntry(reversingEntry);
    }

    for (const event of this.#secondaryEvents) {
      event.reverse();
    }
  }

  #findRule(): PostingRule<AccountingEvent> {
    const rule = this.customer.serviceAgreement.getPostingRule(
      this.type,
      this.whenOccured,
    );

    if (!rule) {
      throw new Error("Missing posting rule");
    }

    return rule;
  }

  protected hasBeenAdjusted(): boolean {
    return this.#replacementEvent ? true : false;
  }
}

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

export {
  AccountingEvent,
  type EventType,
  MonetaryEvent,
  TaxEvent,
  UsageAccountingEvent,
};
