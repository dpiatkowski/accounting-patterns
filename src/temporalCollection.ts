// https://www.martinfowler.com/eaaDev/TemporalProperty.html

interface TemporalCollection<T> {
  /** Returns the value that was effective on the given date. */
  get(date: Temporal.Instant): T | undefined;

  /** The item is valid from the supplied date onwards. */
  put(date: Temporal.Instant, item: T): void;
}

class SingleTemporalCollection<T> implements TemporalCollection<T> {
  readonly #contents: Map<Temporal.Instant, T> = new Map();
  #milestones: Temporal.Instant[] | null = null;

  get(date: Temporal.Instant): T | undefined {
    for (const thisDate of this.#getMilestones()) {
      if (Temporal.Instant.compare(thisDate, date) != 1) {
        return this.#contents.get(thisDate);
      }
    }
  }

  put(date: Temporal.Instant, item: T): void {
    this.#contents.set(date, item);
    this.#clearMilesstones();
  }

  #getMilestones(): Temporal.Instant[] {
    this.#milestones ??= this.#calculateMilestones();
    return this.#milestones;
  }

  #calculateMilestones(): Temporal.Instant[] {
    const milestones = [];

    for (const [entryDate, _] of this.#contents) {
      milestones.push(entryDate);
    }

    milestones.sort(Temporal.Instant.compare);
    milestones.reverse();

    return milestones;
  }

  #clearMilesstones(): void {
    this.#milestones = null;
  }
}

export { SingleTemporalCollection, type TemporalCollection };
