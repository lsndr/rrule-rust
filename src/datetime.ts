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

  private constructor(numeric: number) {
    this.numeric = numeric;
  }

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
   * This method is shorthand for `DateTime.create` with `utc` set to `false`.
   */
  public static local(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
  ): DateTime {
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
  ): DateTime {
    return DateTime.create(year, month, day, hour, minute, second, true);
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

  /**
   * Creates a new DateTime object from provided string representation of a date according to RFC 5545.
   */
  public static fromString(str: string): DateTime {
    const typeError = new TypeError('Invalid date time string');

    if (str.length > 16 || str.length < 15) {
      throw typeError;
    }

    const year = parseInt(str.slice(0, 4));
    const month = parseInt(str.slice(4, 6));
    const day = parseInt(str.slice(6, 8));
    const hour = parseInt(str.slice(9, 11));
    const minute = parseInt(str.slice(11, 13));
    const second = parseInt(str.slice(13, 15));
    const utc = str.endsWith('Z');

    if (
      isNaN(year) ||
      isNaN(month) ||
      isNaN(day) ||
      isNaN(hour) ||
      isNaN(minute) ||
      isNaN(second)
    ) {
      throw typeError;
    }

    return DateTime.create(year, month, day, hour, minute, second, utc);
  }

  /** @internal */
  public static fromNumeric(numeric: number): DateTime {
    return new DateTime(numeric);
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
   * Converts DateTime into ISO 8601 string:
   * - `YYYYMMDDTHHMMSSZ` for UTC
   * - `YYYYMMDDTHHMMSS` for local
   */
  public toString(): string {
    const year = this.year.toString().padStart(4, '0');
    const month = this.month.toString().padStart(2, '0');
    const day = this.day.toString().padStart(2, '0');
    const hour = this.hour.toString().padStart(2, '0');
    const minute = this.minute.toString().padStart(2, '0');
    const second = this.second.toString().padStart(2, '0');

    return `${year}${month}${day}T${hour}${minute}${second}${
      this.utc ? 'Z' : ''
    }`;
  }

  /** @internal */
  public toNumeric(): number {
    return this.numeric;
  }
}
