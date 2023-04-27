class DateRange {
  constructor(readonly from: Date, readonly to: Date) {
    if (from > to) {
      throw new Error("Lower bound date cannot preceed upper bound");
    }
  }

  includes(date: Date): boolean {
    return this.from <= date && date <= this.to;
  }
}

export { DateRange };
