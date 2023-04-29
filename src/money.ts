type Currency = "PLN" | "EUR" | "USD";

class Money {
  constructor(readonly value: number, readonly currency: Currency) {
  }

  static zero(currency: Currency): Money {
    return new Money(0, currency);
  }

  equals(money: Money): boolean {
    return this.currency == money.currency && this.value == money.value;
  }

  negate(): Money {
    return new Money(-this.value, this.currency);
  }

  add(money: Money): Money {
    if (this.currency != money.currency) {
      throw new InvalidCurrencyError(money.currency);
    }

    return new Money(this.value + money.value, this.currency);
  }

  multiply(multiplier: number): Money {
    return new Money(this.value * multiplier, this.currency);
  }
}

class InvalidCurrencyError extends Error {
  constructor(currency: Currency) {
    super();
    this.message = "Attempted opertation with invalid currency: " + currency;
    this.name = "WrongCurrencyError";
  }
}

export { type Currency, InvalidCurrencyError, Money };
