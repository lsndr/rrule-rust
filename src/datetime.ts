/**
 * Represents a date without time information.
 */
export interface DateLike {
  /** Year component (e.g., 2024) */
  readonly year: number;
  /** Month component (1-12) */
  readonly month: number;
  /** Day component (1-31) */
  readonly day: number;
}

/**
 * Represents a date with time information.
 */
export interface DateTimeLike {
  /** Year component (e.g., 2024) */
  readonly year: number;
  /** Month component (1-12) */
  readonly month: number;
  /** Day component (1-31) */
  readonly day: number;
  /** Hour component (0-23) */
  readonly hour: number;
  /** Minute component (0-59) */
  readonly minute: number;
  /** Second component (0-59) */
  readonly second: number;
  /** Whether the time is in UTC */
  readonly utc: boolean;
}

/**
 * Represents time information.
 */
export interface Time {
  /** Hour component (0-23) */
  readonly hour: number;
  /** Minute component (0-59) */
  readonly minute: number;
  /** Second component (0-59) */
  readonly second: number;
  /** Whether the time is in UTC */
  readonly utc: boolean;
}

/**
 * Options for converting DateTime to plain object.
 */
export interface ToPlainDateTimeOptions {
  /** Whether to exclude the `utc` field from the result */
  stripUtc?: boolean;
}

/**
 * Represents a date and time, either local or UTC.
 *
 * The generic type parameter `T` determines whether this is:
 * - `DateTime<Time>` - A date with time information
 * - `DateTime<undefined>` - A date without time information
 *
 * @example
 * ```typescript
 * // Create a date-only DateTime
 * const date = DateTime.date(2024, 1, 15);
 * console.log(date.year, date.month, date.day); // 2024, 1, 15
 *
 * // Create a local DateTime
 * const local = DateTime.local(2024, 1, 15, 14, 30, 0);
 * console.log(local.time?.utc); // false
 *
 * // Create a UTC DateTime
 * const utc = DateTime.utc(2024, 1, 15, 14, 30, 0);
 * console.log(utc.time?.utc); // true
 * ```
 */
export class DateTime<T extends Time | undefined> {
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

  /** The year component of the date (e.g., 2024) */
  public get year(): number {
    return (this.state.year ??= Math.floor(this.state.numeric / 100000000000));
  }

  /** The month component of the date (1-12) */
  public get month(): number {
    return (this.state.month ??= Math.floor(
      (this.state.numeric / 1000000000) % 100,
    ));
  }

  /** The day component of the date (1-31) */
  public get day(): number {
    return (this.state.day ??= Math.floor(
      (this.state.numeric / 10000000) % 100,
    ));
  }

  /**
   * The time component of the DateTime, or undefined for date-only instances.
   * Contains hour, minute, second, and utc flag.
   */
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
   *
   * This method can create either a date-only or date-time instance depending on the parameters.
   *
   * @param year - Year component (e.g., 2024)
   * @param month - Month component (1-12)
   * @param day - Day component (1-31)
   * @param hour - Hour component (0-23), optional
   * @param minute - Minute component (0-59), optional
   * @param second - Second component (0-59), optional
   * @param utc - Whether the time is in UTC, optional
   * @returns A DateTime instance with or without time information
   *
   * @example
   * ```typescript
   * // Create a date-only DateTime
   * const date = DateTime.create(2024, 1, 15);
   *
   * // Create a local DateTime
   * const local = DateTime.create(2024, 1, 15, 14, 30, 0, false);
   *
   * // Create a UTC DateTime
   * const utc = DateTime.create(2024, 1, 15, 14, 30, 0, true);
   * ```
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
   * Creates a new date-only DateTime object (without time information).
   *
   * @param year - Year component (e.g., 2024)
   * @param month - Month component (1-12)
   * @param day - Day component (1-31)
   * @returns A DateTime instance without time information
   *
   * @example
   * ```typescript
   * const date = DateTime.date(2024, 1, 15);
   * console.log(date.toString()); // "20240115"
   * ```
   */
  public static date(
    year: number,
    month: number,
    day: number,
  ): DateTime<undefined> {
    return this.create(year, month, day);
  }

  /**
   * Creates a new local DateTime object (with time in local timezone).
   * This method is shorthand for `DateTime.create` with `utc` set to `false`.
   *
   * @param year - Year component (e.g., 2024)
   * @param month - Month component (1-12)
   * @param day - Day component (1-31)
   * @param hour - Hour component (0-23)
   * @param minute - Minute component (0-59)
   * @param second - Second component (0-59)
   * @returns A DateTime instance with local time
   *
   * @example
   * ```typescript
   * const value = DateTime.local(2024, 1, 15, 14, 30, 0);
   * console.log(value.time.utc); // false
   * console.log(value.toString()); // "20240115T143000"
   * ```
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
   * Creates a new UTC DateTime object (with time in UTC timezone).
   * This method is shorthand for `DateTime.create` with `utc` set to `true`.
   *
   * @param year - Year component (e.g., 2024)
   * @param month - Month component (1-12)
   * @param day - Day component (1-31)
   * @param hour - Hour component (0-23)
   * @param minute - Minute component (0-59)
   * @param second - Second component (0-59)
   * @returns A DateTime instance with UTC time
   *
   * @example
   * ```typescript
   * const value = DateTime.utc(2024, 1, 15, 14, 30, 0);
   * console.log(value.time.utc); // true
   * console.log(value.toString()); // "20240115T143000Z"
   * ```
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
   * Creates a new DateTime object from a plain object representation.
   *
   * @param plain - A plain object with date or date-time components
   * @returns A DateTime instance
   *
   * @example
   * ```typescript
   * // From DateLike
   * const date = DateTime.fromPlain({ year: 2024, month: 1, day: 15 });
   *
   * // From DateTimeLike
   * const datetime = DateTime.fromPlain({
   *   year: 2024, month: 1, day: 15,
   *   hour: 14, minute: 30, second: 0, utc: false
   * });
   * ```
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
   * Creates a new DateTime object from a string representation according to RFC 5545.
   *
   * Supported formats:
   * - `YYYYMMDD` - Date only (e.g., "20240115")
   * - `YYYYMMDDTHHMMSS` - Local date-time (e.g., "20240115T143000")
   * - `YYYYMMDDTHHMMSSZ` - UTC date-time (e.g., "20240115T143000Z")
   *
   * @param str - The RFC 5545 formatted string
   * @returns A DateTime instance
   * @throws {TypeError} If the string format is invalid
   *
   * @example
   * ```typescript
   * // Parse date only
   * const date = DateTime.fromString("20240115");
   *
   * // Parse local date-time
   * const local = DateTime.fromString("20240115T143000");
   *
   * // Parse UTC date-time
   * const utc = DateTime.fromString("20240115T143000Z");
   * ```
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
  public static fromNumeric<DT extends DateTime<Time> | DateTime<undefined>>(
    numeric: number,
  ): DT {
    return new DateTime(numeric) as DT;
  }

  /**
   * Converts the DateTime into a plain object representation.
   *
   * @param options - Conversion options
   * @param options.stripUtc - If true, excludes the `utc` field from the result
   * @returns A plain object with date or date-time components
   *
   * @example
   * ```typescript
   * const utc = DateTime.utc(2024, 1, 15, 14, 30, 0);
   *
   * // With utc field
   * const plain1 = utc.toPlain();
   * // { year: 2024, month: 1, day: 15, hour: 14, minute: 30, second: 0, utc: true }
   *
   * // Without utc field
   * const plain2 = utc.toPlain({ stripUtc: true });
   * // { year: 2024, month: 1, day: 15, hour: 14, minute: 30, second: 0 }
   *
   * // Date-only DateTime
   * const date = DateTime.date(2024, 1, 15);
   * const plain3 = date.toPlain();
   * // { year: 2024, month: 1, day: 15 }
   * ```
   */
  public toPlain<DTL extends DateTimeLike>(
    options?: ToPlainDateTimeOptions & { stripUtc: false },
  ): DTL;
  public toPlain<DTL extends Omit<DateTimeLike, 'utc'>>(
    options?: ToPlainDateTimeOptions & { stripUtc: true },
  ): DTL;
  public toPlain<DTL extends DateLike>(): DTL;
  public toPlain<
    DTL extends DateTimeLike | DateLike = T extends Time
      ? DateTimeLike | Omit<DateTimeLike, 'utc'>
      : DateLike,
  >(options?: ToPlainDateTimeOptions): DTL {
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

    return plain as DTL;
  }

  /**
   * Converts the DateTime into an RFC 5545 formatted string.
   *
   * Format depends on the DateTime type:
   * - `YYYYMMDD` for date only
   * - `YYYYMMDDTHHMMSSZ` for UTC date-time
   * - `YYYYMMDDTHHMMSS` for local date-time
   *
   * @returns An RFC 5545 formatted string
   *
   * @example
   * ```typescript
   * const date = DateTime.date(2024, 1, 15);
   * console.log(date.toString()); // "20240115"
   *
   * const local = DateTime.local(2024, 1, 15, 14, 30, 0);
   * console.log(local.toString()); // "20240115T143000"
   *
   * const utc = DateTime.utc(2024, 1, 15, 14, 30, 0);
   * console.log(utc.toString()); // "20240115T143000Z"
   * ```
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
