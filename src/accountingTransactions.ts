import { Account, deposit, withdrawal } from "./account.ts";
import { Money } from "./money.ts";

// need to abstract this later
type TwoLeggedEntry = {
  amount: Money;
  date: Date;
};

class TwoLeggedAccountingTransaction {
  readonly #entries: TwoLeggedEntry[] = [];

  constructor(amount: Money, from: Account, to: Account, date: Date) {
    const fromEntry = withdrawal(amount, date);
    from.addEntry(fromEntry);
    this.#entries.push(fromEntry);

    const toEntry = deposit(amount, date);
    to.addEntry(toEntry);
    this.#entries.push(toEntry);
  }
}

export { TwoLeggedAccountingTransaction };
