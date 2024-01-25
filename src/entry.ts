import { Money } from "./money.ts";

type EntryType = "BaseUsage" | "ServiceFee" | "Tax";

type Entry = Readonly<{
  amount: Money;
  date: Temporal.Instant;
  type: EntryType;
}>;

export { type Entry, type EntryType };
