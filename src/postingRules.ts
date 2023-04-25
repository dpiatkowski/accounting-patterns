import { type EntryType } from "./entry.ts";
import {
  type AccountingEvent,
  MonetaryEvent,
  TaxEvent,
  UsageAccountingEvent,
} from "./events.ts";
import { type Money } from "./money.ts";

abstract class PostingRule {
  protected type: EntryType;

  constructor(type: EntryType) {
    this.type = type;
  }

  process(event: AccountingEvent): void {
    const amount = this.calculateAmount(event);

    this.#makeEntry(event, amount);

    if (this.#isTaxable()) {
      new TaxEvent(event, amount).process();
    }
  }

  #makeEntry(event: AccountingEvent, amount: Money): void {
    const newEntry = {
      amount: amount,
      date: event.whenNoticed,
      type: this.type,
    };

    event.customer.addEntry(newEntry);
    event.addResultingEntry(newEntry);
  }

  #isTaxable(): boolean {
    return this.type !== "Tax";
  }

  protected abstract calculateAmount(event: AccountingEvent): Money;
}

class MultiplyByRatePostingRule extends PostingRule {
  constructor(type: EntryType) {
    super(type);
  }

  protected calculateAmount(event: AccountingEvent): Money {
    if (event instanceof UsageAccountingEvent) {
      return event.amount * event.rate;
    }

    return 0;
  }
}

class AmmountFormulaPostingRule extends PostingRule {
  constructor(
    private multiplier: number,
    private fixedFee: Money,
    type: EntryType,
  ) {
    super(type);
  }

  protected calculateAmount(event: AccountingEvent): number {
    if (event instanceof MonetaryEvent) {
      return event.amount * this.multiplier + this.fixedFee;
    }

    return 0;
  }
}

class PoolCapPostingRule extends PostingRule {
  constructor(
    private rate: number,
    private usageLimit: number,
    type: EntryType,
  ) {
    super(type);
  }

  protected calculateAmount(event: AccountingEvent): Money {
    if (event instanceof UsageAccountingEvent) {
      const rate = event.amount > this.usageLimit ? event.rate : this.rate;
      return event.amount * rate;
    }

    return 0;
  }
}

export {
  AmmountFormulaPostingRule,
  MultiplyByRatePostingRule,
  PoolCapPostingRule,
  PostingRule,
};
