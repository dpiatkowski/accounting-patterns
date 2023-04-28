import { Account } from "./account.ts";
import { Money } from "./money.ts";

class AccountingEntry {
  constructor(
    readonly amount: Money,
    readonly date: Date,
    readonly account: Account,
    readonly transaction: AccountingTransaction,
  ) {
  }

  post(): void {
    this.account.addEntry(this);
  }
}

class AccountingTransaction {
  readonly #date: Date;
  readonly #entries: AccountingEntry[] = [];
  readonly #wasPosted: boolean = false;

  constructor(date: Date) {
    this.#date = date;
  }

  add(amount: Money, account: Account): void {
    if (this.#wasPosted) {
      // TODO: custom error?
      throw new Error(
        "Cannot add entry to a transaction that is already posted",
      );
    }

    this.#entries.push(
      new AccountingEntry(amount, this.#date, account, this),
    );
  }

  post(): void {
    if (!this.canPost()) {
      throw new UnableToPostTransactionError();
    }

    for (const entry of this.#entries) {
      entry.post();
    }
  }

  canPost(): boolean {
    return this.#wasPosted == false && this.#balance() == 0;
  }

  #balance(): Money {
    if (this.#entries.length == 0) {
      return 0;
    }

    let result = 0;

    for (const entry of this.#entries) {
      result += entry.amount;
    }

    return result;
  }
}

class UnableToPostTransactionError extends Error {
  constructor() {
    super();
    this.name = "UnableToPostTransactionError";
  }
}

export { AccountingTransaction, UnableToPostTransactionError };
