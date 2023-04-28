import { AccountingTransaction } from "./accountingTransactions.ts";
import { Account } from "./account.ts";
import { assertEquals } from "testing/asserts.ts";

Deno.test("Multi-legged transaction between 3 accounts", () => {
  const revenue = new Account("PLN");
  const recivables = new Account("PLN");
  const defferd = new Account("PLN");

  const transaction = new AccountingTransaction(new Date());
  transaction.add(-700, revenue);
  transaction.add(500, recivables);
  transaction.add(200, defferd);
  transaction.post();

  const now = new Date();
  assertEquals(revenue.balance(now), -700);
  assertEquals(recivables.balance(now), 500);
  assertEquals(defferd.balance(now), 200);
});
