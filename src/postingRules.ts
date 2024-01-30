import { type EntryType } from "./entry.ts";
import {
  AccountingEvent,
  MonetaryEvent,
  TaxEvent,
  UsageAccountingEvent,
} from "./events.ts";
import { type Money } from "./money.ts";

abstract class PostingRule<TEvent extends AccountingEvent> {
  protected type: EntryType;

  constructor(type: EntryType) {
    this.type = type;
  }

  process(event: TEvent): void {
    const amount = this.calculateAmount(event);

    this.#makeEntry(event, amount);

    if (this.#isTaxable()) {
      new TaxEvent(event, amount).process();
    }
  }

  #makeEntry(event: TEvent, amount: Money): void {
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

  protected abstract calculateAmount(event: TEvent): Money;
}

class MultiplyByRatePostingRule extends PostingRule<UsageAccountingEvent> {
  constructor(type: EntryType) {
    super(type);
  }

  protected calculateAmount(event: UsageAccountingEvent): Money {
    return event.amount.multiply(event.rate);
  }
}

class AmmountFormulaPostingRule extends PostingRule<MonetaryEvent> {
  constructor(
    private multiplier: number,
    private fixedFee: Money,
    type: EntryType,
  ) {
    super(type);
  }

  protected calculateAmount(event: MonetaryEvent): Money {
    return event.amount.multiply(this.multiplier).add(this.fixedFee);
  }
}

class PoolCapPostingRule extends PostingRule<UsageAccountingEvent> {
  constructor(
    private rate: number,
    private usageLimit: number,
    type: EntryType,
  ) {
    super(type);
  }

  protected calculateAmount(event: UsageAccountingEvent): Money {
    const rate = event.amount.value > this.usageLimit ? event.rate : this.rate;
    return event.amount.multiply(rate);
  }
}

export {
  AmmountFormulaPostingRule,
  MultiplyByRatePostingRule,
  PoolCapPostingRule,
  PostingRule,
};
