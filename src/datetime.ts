export interface DateTimeLike {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
  readonly utc: boolean;
}

export class DateTime implements DateTimeLike {
  private readonly numeric: number;

  get year(): number {
    return Math.floor(this.numeric / 100000000000);
  }

  get month(): number {
    return Math.floor((this.numeric / 1000000000) % 100);
  }

  get day(): number {
    return Math.floor((this.numeric / 10000000) % 100);
  }

  get hour(): number {
    return Math.floor((this.numeric / 100000) % 100);
  }

  get minute(): number {
    return Math.floor((this.numeric / 1000) % 100);
  }

  get second(): number {
    return Math.floor((this.numeric / 10) % 100);
  }

  get utc(): boolean {
    return this.numeric % 10 == 1;
  }

  private constructor(numeric: number) {
    this.numeric = numeric;
  }

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

  public static now(): DateTime {
    const now = new Date();

    return DateTime.fromObject({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
      utc: false,
    });
  }

  public static fromDate(
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

  public static fromObject(object: DateTimeLike): DateTime {
    return DateTime.fromDate(
      object.year,
      object.month,
      object.day,
      object.hour,
      object.minute,
      object.second,
      object.utc,
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
