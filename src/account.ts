import { DateRange } from "./dateRange.ts";
import { Entry, EntryType } from "./entry.ts";
import { type Currency, type Money } from "./money.ts";

class Account {
  readonly #entries: Entry[] = [];

  constructor(readonly currency: Currency) {
  }

  depositMoney(amount: Money, date: Date): void {
    this.#addEntry(amount, date, "Deposit");
  }

  withdrawMoney(amount: Money, date: Date): void {
    this.#addEntry(-amount, date, "Withdrawal");
  }

  #addEntry(amount: Money, date: Date, type: EntryType): void {
    if (amount == 0) {
      throw new Error("Creating entry with 0 as amount");
    }

    // missing validation for Money object currency
    this.#entries.push({
      amount: amount,
      date: date,
      type: type,
    });
  }

  balance(dateorDateRange: Date | DateRange): Money {
    if (dateorDateRange instanceof Date) {
      return this.#calculateValueFromEntries(
        new DateRange(new Date(), dateorDateRange),
        (_) => true,
      );
    }

    return this.#calculateValueFromEntries(dateorDateRange, (_) => true);
  }

  deposits(dateRange: DateRange): Money {
    return this.#calculateValueFromEntries(
      dateRange,
      (entry) => entry.amount > 0,
    );
  }

  withdrawals(dateRange: DateRange): Money {
    return this.#calculateValueFromEntries(
      dateRange,
      (entry) => entry.amount < 0,
    );
  }

  #calculateValueFromEntries(
    dateRange: DateRange,
    entryPredicate: (entry: Entry) => boolean,
  ): Money {
    let result = 0;

    for (const entry of this.#entries) {
      if (dateRange.includes(entry.date) && entryPredicate(entry)) {
        result += entry.amount;
      }
    }

    return result;
  }
}

export { Account };
