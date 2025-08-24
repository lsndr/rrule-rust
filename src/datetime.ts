export interface DateLike {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

export interface DateTimeLike {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly utc: boolean;
}

export interface Time {
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly utc: boolean;
}

export interface ToPlainDateTimeOptions {
  stripUtc?: boolean;
}

/**
 * Represents a date and time. Either local or UTC.
 */
export class DateTime<T extends Time | undefined = Time> {
  private readonly state: {
    numeric: number;
    year?: number;
    month?: number;
    day?: number;
    time?: {
      hour: number;
      minute: number;
      second: number;
      utc: boolean;
    };
  };

  private constructor(numeric: number) {
    this.state = {
      numeric,
    };
  }

  public get year(): number {
    return (this.state.year ??= Math.floor(this.state.numeric / 100000000000));
  }

  public get month(): number {
    return (this.state.month ??= Math.floor(
      (this.state.numeric / 1000000000) % 100,
    ));
  }

  public get day(): number {
    return (this.state.day ??= Math.floor(
      (this.state.numeric / 10000000) % 100,
    ));
  }

  public get time(): T {
    // return cached time if available
    if ('time' in this.state) {
      return this.state.time as T;
    }

    const type = this.state.numeric % 10; // 0 – non utc, 1 – utc, 2 – date only

    if (type == 2) {
      // if it's date only, return undefined and cache it in state
      return (this.state.time ??= undefined) as T;
    } else {
      // otherwise compute it from numeric representation and cache it in state
      return (this.state.time ??= {
        hour: Math.floor((this.state.numeric / 100000) % 100),
        minute: Math.floor((this.state.numeric / 1000) % 100),
        second: Math.floor((this.state.numeric / 10) % 100),
        utc: this.state.numeric % 10 == 1,
      }) as T;
    }
  }

  /**
   * Creates a new DateTime object from the given date and time components.
   */
  public static create(
    year: number,
    month: number,
    day: number,
  ): DateTime<undefined>;
  public static create(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
    utc: boolean,
  ): DateTime<Time>;
  public static create(
    year: number,
    month: number,
    day: number,
    hour?: number,
    minute?: number,
    second?: number,
    utc?: boolean,
  ): DateTime<Time> | DateTime<undefined> {
    let numeric = year * 100000000000 + month * 1000000000 + day * 10000000;

    if (
      hour !== undefined &&
      minute !== undefined &&
      second !== undefined &&
      utc !== undefined
    ) {
      numeric += hour * 100000;
      numeric += minute * 1000;
      numeric += second * 10;
      numeric += utc ? 1 : 0;

      return new DateTime<Time>(numeric);
    } else {
      numeric += 100000;
      numeric += 1000;
      numeric += 10;
      numeric += 2;

      return new DateTime<undefined>(numeric);
    }
  }

  /**
   * Creates a new DateTime object from the given date and time components.
   */
  public static date(
    year: number,
    month: number,
    day: number,
  ): DateTime<undefined> {
    return this.create(year, month, day);
  }

  /**
   * This method is shorthand for `DateTime.create` with `utc` set to `false`.
   */
  public static local(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
  ): DateTime<Time> {
    return DateTime.create(year, month, day, hour, minute, second, false);
  }

  /**
   * This method is shorthand for `DateTime.create` with `utc` set to `true`.
   */
  public static utc(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
  ): DateTime<Time> {
    return DateTime.create(year, month, day, hour, minute, second, true);
  }

  /**
   * Creates a new DateTime object from the given plain object.
   */
  public static fromPlain(plain: DateTimeLike): DateTime<Time>;
  public static fromPlain(plain: DateLike): DateTime<undefined>;
  public static fromPlain(
    plain: DateTimeLike | DateLike,
  ): DateTime<Time> | DateTime<undefined> {
    if ('hour' in plain) {
      return DateTime.create(
        plain.year,
        plain.month,
        plain.day,
        plain.hour,
        plain.minute,
        plain.second,
        plain.utc,
      );
    }

    return DateTime.create(plain.year, plain.month, plain.day);
  }

  /**
   * Creates a new DateTime object from provided string representation of a date according to RFC 5545.
   */
  // TODO: add template expression
  public static fromString(str: string): DateTime<Time> | DateTime<undefined> {
    if (!(str.length === 8 || (str.length <= 16 && str.length >= 15))) {
      throw new TypeError('Invalid date time string');
    }

    const year = parseInt(str.slice(0, 4));
    const month = parseInt(str.slice(4, 6));
    const day = parseInt(str.slice(6, 8));
    let hour: number | undefined = undefined;
    let minute: number | undefined = undefined;
    let second: number | undefined = undefined;
    let utc: boolean | undefined = undefined;

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      throw new TypeError('Invalid date');
    }

    if (str.length > 8) {
      hour = parseInt(str.slice(9, 11));
      minute = parseInt(str.slice(11, 13));
      second = parseInt(str.slice(13, 15));
      utc = str.endsWith('Z');

      if (isNaN(hour) || isNaN(minute) || isNaN(second)) {
        throw new TypeError('Invalid time');
      }

      return DateTime.create(year, month, day, hour, minute, second, utc);
    } else {
      return DateTime.create(year, month, day);
    }
  }

  /** @internal */
  public static fromNumeric(
    numeric: number,
  ): DateTime<Time> | DateTime<undefined> {
    return new DateTime(numeric) as DateTime<Time> | DateTime<undefined>;
  }

  /**
   * Converts DateTime into a plain object.
   */
  public toPlain(
    options: T extends Time
      ? ToPlainDateTimeOptions & { stripUtc: false }
      : never,
  ): DateTimeLike;
  public toPlain(
    options: T extends Time
      ? ToPlainDateTimeOptions & { stripUtc: true }
      : never,
  ): Omit<DateTimeLike, 'utc'>;
  public toPlain(): T extends Time ? DateTimeLike : DateLike;
  public toPlain(
    options?: ToPlainDateTimeOptions,
  ):
    | (T extends Time ? DateTimeLike : DateLike)
    | DateTimeLike
    | Omit<DateTimeLike, 'utc'> {
    let plain: unknown;

    if (this.time) {
      plain = options?.stripUtc
        ? {
            year: this.year,
            month: this.month,
            day: this.day,
            hour: this.time.hour,
            minute: this.time.minute,
            second: this.time.second,
          }
        : {
            year: this.year,
            month: this.month,
            day: this.day,
            hour: this.time.hour,
            minute: this.time.minute,
            second: this.time.second,
            utc: this.time.utc,
          };
    } else {
      plain = {
        year: this.year,
        month: this.month,
        day: this.day,
      };
    }

    return plain as T extends Time ? DateTimeLike : DateLike;
  }

  /**
   * Converts DateTime into ISO 8601 string:
   * * `YYYYMMDD` for date only
   * - `YYYYMMDDTHHMMSSZ` for UTC
   * - `YYYYMMDDTHHMMSS` for local
   */
  public toString(): string {
    let str =
      this.year.toString().padStart(4, '0') +
      this.month.toString().padStart(2, '0') +
      this.day.toString().padStart(2, '0');

    if (this.time) {
      str +=
        'T' +
        this.time.hour.toString().padStart(2, '0') +
        this.time.minute.toString().padStart(2, '0') +
        this.time.second.toString().padStart(2, '0') +
        (this.time.utc ? 'Z' : '');
    }

    return str;
  }

  /** @internal */
  public toNumeric(): number {
    return this.state.numeric;
  }
}
