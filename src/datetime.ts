export interface DateTimeLike {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
}

export interface FromObjectOptions {
  utc?: boolean;
}

/**
 * Represents a date and time. Either local or UTC.
 */
export class DateTime implements DateTimeLike {
  private readonly numeric: number;

  public get year(): number {
    return Math.floor(this.numeric / 100000000000);
  }

  public get month(): number {
    return Math.floor((this.numeric / 1000000000) % 100);
  }

  public get day(): number {
    return Math.floor((this.numeric / 10000000) % 100);
  }

  public get hour(): number {
    return Math.floor((this.numeric / 100000) % 100);
  }

  public get minute(): number {
    return Math.floor((this.numeric / 1000) % 100);
  }

  public get second(): number {
    return Math.floor((this.numeric / 10) % 100);
  }

  public get utc(): boolean {
    return this.numeric % 10 == 1;
  }

  private constructor(numeric: number) {
    this.numeric = numeric;
  }

  /**
   * Converts DateTime into a plain object.
   */
  public toObject(): DateTimeLike {
    return {
      year: this.year,
      month: this.month,
      day: this.day,
      hour: this.hour,
      minute: this.minute,
      second: this.second,
    };
  }

  /**
   * Creates a new DateTime object from the given date and time components.
   */
  public static create(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
    utc: boolean,
  ): DateTime {
    const numeric =
      year * 100000000000 +
      month * 1000000000 +
      day * 10000000 +
      hour * 100000 +
      minute * 1000 +
      second * 10 +
      (utc ? 1 : 0);

    return new DateTime(numeric);
  }

  /**
   * Creates a new DateTime object from the given plain object.
   */
  public static fromObject(
    object: DateTimeLike,
    options?: FromObjectOptions,
  ): DateTime {
    return DateTime.create(
      object.year,
      object.month,
      object.day,
      object.hour,
      object.minute,
      object.second,
      !!options?.utc,
    );
  }

  /** @internal */
  public static fromNumeric(numeric: number): DateTime {
    return new DateTime(numeric);
  }

  /** @internal */
  public toNumeric(): number {
    return this.numeric;
  }
}
