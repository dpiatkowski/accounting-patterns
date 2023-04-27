import { Money } from "./money.ts";

type EntryType = "BaseUsage" | "ServiceFee" | "Tax" | "Deposit" | "Withdrawal";

type Entry = Readonly<{
  amount: Money;
  date: Date;
  type: EntryType;
}>;

export { type Entry, type EntryType };
