import { type EventType } from "./events.ts";
import { type PostingRule } from "./postingRules.ts";
import { SingleTemporalCollection } from "./temporalCollection.ts";

class ServiceAgreement {
  readonly #postingRules: Map<
    EventType,
    SingleTemporalCollection<PostingRule>
  > = new Map<EventType, SingleTemporalCollection<PostingRule>>();

  constructor(readonly rate: number) {
  }

  addPostingRule(eventType: EventType, rule: PostingRule, date: Date): void {
    if (!this.#postingRules.has(eventType)) {
      this.#postingRules.set(
        eventType,
        new SingleTemporalCollection<PostingRule>(),
      );
    }

    this.#temporalCollection(eventType).put(date, rule);
  }

  getPostingRule(eventType: EventType, date: Date): PostingRule | undefined {
    return this.#temporalCollection(eventType).get(date);
  }

  #temporalCollection(
    eventType: EventType,
  ): SingleTemporalCollection<PostingRule> {
    const result = this.#postingRules.get(eventType);

    if (!result) {
      throw new Error("No Posting Rules for Event Type: " + eventType);
    }

    return result;
  }
}

export { ServiceAgreement };
