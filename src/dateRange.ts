class DateRange {
  constructor(readonly from: Temporal.Instant, readonly to: Temporal.Instant) {
    if (Temporal.Instant.compare(from, to) == 1) {
      throw new Error("Lower bound date cannot preceed upper bound");
    }
  }

  includes(date: Temporal.Instant): boolean {
    const lowerBoundComparison = Temporal.Instant.compare(this.from, date);
    const upperBoundComparison = Temporal.Instant.compare(date, this.to);

    return (lowerBoundComparison == -1 || lowerBoundComparison == 0) &&
      (upperBoundComparison == -1 || upperBoundComparison == 0);
  }
}

export { DateRange };
