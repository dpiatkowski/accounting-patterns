import { type Entry } from "./entry.ts";
import { type ServiceAgreement } from "./serviceAgreement.ts";

class Customer {
  readonly #entries: Entry[] = [];

  constructor(
    readonly name: string,
    readonly serviceAgreement: ServiceAgreement
  ) {}

  addEntry(entry: Entry) {
    this.#entries.push(entry);
  }

  getEntries(): ReadonlyArray<Entry> {
    return this.#entries;
  }
}

export { Customer };
