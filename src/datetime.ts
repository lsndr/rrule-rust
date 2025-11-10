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

export type StripUtc<T extends DateTimeLike> = Omit<T, 'utc'>;

export type OptionalUtc<T extends DateTimeLike> = Omit<T, 'utc'> & {
  utc?: boolean;
};

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
  public readonly year: number;
  public readonly month: number;
  public readonly day: number;
  public readonly time: T;

  private offset?: number;

  private constructor(year: number, month: number, day: number, time: T) {
    this.year = year;
    this.month = month;
    this.day = day;
    this.time = time;
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
    if (
      hour !== undefined &&
      minute !== undefined &&
      second !== undefined &&
      utc !== undefined
    ) {
      const dt = new DateTime<Time>(year, month, day, {
        hour,
        minute,
        second,
        utc,
      });

      dt.offset = utc ? 0 : undefined;

      return dt;
    } else {
      return new DateTime<undefined>(year, month, day, undefined);
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
  public static fromPlain(plain: OptionalUtc<DateTimeLike>): DateTime<Time>;
  public static fromPlain(plain: StripUtc<DateTimeLike>): DateTime<Time>;
  public static fromPlain(plain: DateLike): DateTime<undefined>;
  public static fromPlain(
    plain: OptionalUtc<DateTimeLike> | DateLike,
  ): DateTime<undefined> | DateTime<Time> {
    if ('hour' in plain) {
      return DateTime.create(
        plain.year,
        plain.month,
        plain.day,
        plain.hour,
        plain.minute,
        plain.second,
        plain.utc ?? false,
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
  public static fromNumbers<DT extends DateTime<Time> | DateTime<undefined>>(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
    offset: number,
  ): DT {
    const dt = new DateTime(
      year,
      month,
      day,
      hour !== -1
        ? {
            hour,
            minute,
            second,
            utc: offset === 0,
          }
        : undefined,
    ) as DT;

    dt.offset = offset === -1 ? undefined : offset;

    return dt;
  }

  /** @internal */
  public static fromInt32Array<DT extends DateTime<Time> | DateTime<undefined>>(
    arr: Int32Array,
  ): DT {
    return this.fromNumbers<DT>(
      arr[0]!,
      arr[1]!,
      arr[2]!,
      arr[3]!,
      arr[4]!,
      arr[5]!,
      arr[6]!,
    );
  }

  /** @internal */
  public static fromFlatInt32Array<
    DT extends DateTime<Time> | DateTime<undefined>,
  >(raw: Int32Array): DT[] {
    const result: DT[] = [];

    for (let i = 0; i < raw.length; i += 7) {
      result.push(
        this.fromNumbers(
          raw[i]!,
          raw[i + 1]!,
          raw[i + 2]!,
          raw[i + 3]!,
          raw[i + 4]!,
          raw[i + 5]!,
          raw[i + 6]!,
        ),
      );
    }

    return result;
  }

  /** @internal */
  public static toFlatInt32Array(
    datetimes: (DateTime<Time> | DateTime<undefined>)[],
  ): Int32Array {
    const arr = new Int32Array(datetimes.length * 7);

    for (let i = 0; i < datetimes.length; i++) {
      const dt = datetimes[i]!;
      const offset = i * 7;

      arr[offset] = dt.year;
      arr[offset + 1] = dt.month;
      arr[offset + 2] = dt.day;

      if (dt.time) {
        arr[offset + 3] = dt.time.hour;
        arr[offset + 4] = dt.time.minute;
        arr[offset + 5] = dt.time.second;
        arr[offset + 6] = dt.offset ?? -1;
      } else {
        arr[offset + 3] = -1;
        arr[offset + 4] = -1;
        arr[offset + 5] = -1;
        arr[offset + 6] = -1;
      }
    }

    return arr;
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
  public toPlain(
    options: ToPlainDateTimeOptions & { stripUtc: false },
  ): T extends Time ? DateTimeLike : DateLike;
  public toPlain(
    options: ToPlainDateTimeOptions & { stripUtc: true },
  ): T extends Time ? StripUtc<DateTimeLike> : DateLike;
  public toPlain(): T extends Time ? DateTimeLike : DateLike;
  public toPlain(
    options?: ToPlainDateTimeOptions,
  ): DateTimeLike | StripUtc<DateTimeLike> | DateLike {
    let plain: DateTimeLike | StripUtc<DateTimeLike> | DateLike;

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

    return plain;
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

  public toTimestamp(): number {
    if (typeof this.offset === 'undefined') {
      throw new Error('There is no information about time zone offset');
    }

    return this.toMilliseconds();
  }

  public toDate(): Date {
    if (typeof this.offset !== 'number') {
      throw new Error('There is no information about time zone offset');
    }

    return new Date(this.toMilliseconds());
  }

  /** @internal */
  public toInt32Array(): Int32Array {
    return new Int32Array([
      this.year,
      this.month,
      this.day,
      this.time ? this.time.hour : -1,
      this.time ? this.time.minute : -1,
      this.time ? this.time.second : -1,
      this.offset ?? -1,
    ]);
  }

  private toMilliseconds(): number {
    let time = Date.UTC(
      this.year,
      this.month - 1,
      this.day,
      this.time?.hour ?? 0,
      this.time?.minute ?? 0,
      this.time?.second ?? 0,
    );

    time -= (this.offset ?? 0) * 1000;

    return time;
  }
}
