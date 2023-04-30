import { type Customer } from "../customer.ts";
import { type Entry } from "../entry.ts";
import { PostingRule } from "../postingRules.ts";

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
}

export { AccountingEvent, type EventType };
