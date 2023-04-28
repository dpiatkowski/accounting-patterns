import { DateRange } from "./dateRange.ts";
import { type Currency, type Money } from "./money.ts";

type AccountEntry = {
  amount: Money;
  date: Date;
};

function deposit(amount: Money, date: Date): AccountEntry {
  return {
    amount,
    date,
  };
}

function withdrawal(amount: Money, date: Date): AccountEntry {
  return {
    amount: -amount,
    date,
  };
}

class Account {
  readonly #entries: AccountEntry[] = [];

  constructor(readonly currency: Currency) {
  }

  addEntry(entry: AccountEntry): void {
    if (entry.amount == 0) {
      throw new Error("Creating entry with 0 as amount");
    }

    // missing validation for Money object currency
    this.#entries.push(entry);
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
    entryPredicate: (entry: AccountEntry) => boolean,
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

export { Account, type AccountEntry, deposit, withdrawal };
