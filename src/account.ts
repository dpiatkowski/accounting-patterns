import { AccountingTransaction } from "./accountingTransactions.ts";
import { DateRange } from "./dateRange.ts";
import { type Currency, Money } from "./money.ts";

type AccountEntry = {
  amount: Money;
  date: Temporal.Instant;
};

function deposit(amount: Money, date: Temporal.Instant): AccountEntry {
  return {
    amount,
    date,
  };
}

function withdrawal(amount: Money, date: Temporal.Instant): AccountEntry {
  return {
    amount: amount.negate(),
    date,
  };
}

class Account {
  readonly #entries: AccountEntry[] = [];

  constructor(readonly currency: Currency) {}

  addEntry(entry: AccountEntry): void {
    if (entry.amount.value == 0) {
      throw new Error("Creating entry with 0 as amount");
    }

    // missing validation for Money object currency
    this.#entries.push(entry);
  }

  withdraw(amount: Money, target: Account, date: Temporal.Instant): void {
    const transaction = new AccountingTransaction(date);
    transaction.add(amount.negate(), this);
    transaction.add(amount, target);
    transaction.post();
  }

  // TODO: is Temporal case even necessary?
  balance(dateorDateRange: Temporal.Instant | DateRange): Money {
    if (dateorDateRange instanceof Temporal.Instant) {
      return this.#calculateValueFromEntries(
        new DateRange(dateorDateRange, dateorDateRange),
        (_) => true,
      );
    }

    return this.#calculateValueFromEntries(dateorDateRange, (_) => true);
  }

  deposits(dateRange: DateRange): Money {
    return this.#calculateValueFromEntries(
      dateRange,
      (entry) => entry.amount.value > 0,
    );
  }

  withdrawals(dateRange: DateRange): Money {
    return this.#calculateValueFromEntries(
      dateRange,
      (entry) => entry.amount.value < 0,
    );
  }

  #calculateValueFromEntries(
    dateRange: DateRange,
    entryPredicate: (entry: AccountEntry) => boolean,
  ): Money {
    let result = Money.zero("PLN");

    for (const entry of this.#entries) {
      if (dateRange.includes(entry.date) && entryPredicate(entry)) {
        result = result.add(entry.amount);
      }
    }

    return result;
  }
}

export { Account, type AccountEntry, deposit, withdrawal };
