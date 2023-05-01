import { type Customer } from "../customer.ts";
import { type Entry } from "../entry.ts";
import { PostingRule } from "../postingRules.ts";

type EventType = "Usage" | "ServiceCall" | "Tax" | "Adjustment";

class AccountingEvent {
  readonly #resultingEntries: Entry[] = [];
  readonly #secondaryEvents: AccountingEvent[] = [];
  #isProcessed = false;
  #adjustedEvent: AccountingEvent | undefined;
  #replacementEvent: AccountingEvent | null = null;

  constructor(
    readonly type: EventType,
    readonly whenOccured: Date,
    readonly whenNoticed: Date,
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

export { AccountingEvent, type EventType };
