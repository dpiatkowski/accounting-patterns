// https://www.martinfowler.com/eaaDev/TemporalProperty.html

interface TemporalCollection<T> {
  /** Returns the value that was effective on the given date. */
  get(date: Date): T | undefined;

  /** The item is valid from the supplied date onwards. */
  put(date: Date, item: T): void;
}

class SingleTemporalCollection<T> implements TemporalCollection<T> {
  readonly #contents: Map<Date, T> = new Map();
  #milestones: Date[] | null = null;

  get(date: Date): T | undefined {
    for (const thisDate of this.#getMilestones()) {
      if (thisDate <= date) {
        return this.#contents.get(thisDate);
      }
    }
  }

  put(date: Date, item: T): void {
    this.#contents.set(date, item);
    this.#clearMilesstones();
  }

  #getMilestones(): Date[] {
    this.#milestones ??= this.#calculateMilestones();
    return this.#milestones;
  }

  #calculateMilestones(): Date[] {
    const milestones = [];

    for (const [entryDate, _] of this.#contents) {
      milestones.push(entryDate);
    }

    milestones.sort();
    milestones.reverse();

    return milestones;
  }

  #clearMilesstones(): void {
    this.#milestones = null;
  }
}

export { SingleTemporalCollection, type TemporalCollection };
