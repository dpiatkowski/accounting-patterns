import { AccountingEvent, type EventType } from "./events/mod.ts";
import { type PostingRule } from "./postingRules.ts";
import { SingleTemporalCollection } from "./temporalCollection.ts";

class ServiceAgreement {
  readonly #postingRules: Map<
    EventType,
    SingleTemporalCollection<PostingRule<AccountingEvent>>
  > = new Map<
    EventType,
    SingleTemporalCollection<PostingRule<AccountingEvent>>
  >();

  constructor(readonly rate: number) {}

  addPostingRule<TEvent extends AccountingEvent>(
    eventType: EventType,
    rule: PostingRule<TEvent>,
    date: Temporal.Instant,
  ): void {
    if (!this.#postingRules.has(eventType)) {
      this.#postingRules.set(
        eventType,
        new SingleTemporalCollection<PostingRule<TEvent>>(),
      );
    }

    this.#temporalCollection(eventType).put(date, rule);
  }

  getPostingRule<TEvent extends AccountingEvent>(
    eventType: EventType,
    date: Temporal.Instant,
  ): PostingRule<TEvent> | undefined {
    return this.#temporalCollection(eventType).get(date);
  }

  #temporalCollection<TEvent extends AccountingEvent>(
    eventType: EventType,
  ): SingleTemporalCollection<PostingRule<TEvent>> {
    const result = this.#postingRules.get(eventType);

    if (!result) {
      throw new Error("No Posting Rules for Event Type: " + eventType);
    }

    return result;
  }
}

export { ServiceAgreement };
