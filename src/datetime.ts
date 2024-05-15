export interface DateTimeLike {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  /**
   * Whether the date and time is in UTC.
   */
  readonly utc: boolean;
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
   * Converts DateTime into Date object:
   * - If DateTime is UTC, returns a Date object created from UTC time.
   * - If DateTime is local, returns a Date object with local time.
   */
  public toDate(): Date {
    if (this.utc) {
      return new Date(
        Date.UTC(
          this.year,
          this.month - 1,
          this.day,
          this.hour,
          this.minute,
          this.second,
        ),
      );
    } else {
      return new Date(
        this.year,
        this.month - 1,
        this.day,
        this.hour,
        this.minute,
        this.second,
      );
    }
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
      utc: this.utc,
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
  public static fromObject(object: DateTimeLike): DateTime {
    return DateTime.create(
      object.year,
      object.month,
      object.day,
      object.hour,
      object.minute,
      object.second,
      object.utc,
    );
  }

  /**
   * Creates a new DateTime object from the given plain object. If options.utc is true, then it will use `getUTC*` methods.
   */
  public static fromDate(date: Date, options?: { utc?: boolean }): DateTime {
    if (options?.utc) {
      return DateTime.create(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        true,
      );
    } else {
      return DateTime.create(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        false,
      );
    }
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
