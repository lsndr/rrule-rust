export interface DateTimeLike {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
}

export class DateTime implements DateTimeLike {
  public readonly year: number;
  public readonly month: number;
  public readonly day: number;
  public readonly hour: number;
  public readonly minute: number;
  public readonly second: number;

  constructor(options?: DateTimeLike) {
    if (options) {
      this.year = options.year;
      this.month = options.month;
      this.day = options.day;
      this.hour = options.hour;
      this.minute = options.minute;
      this.second = options.second;
    } else {
      const date = new Date();

      this.year = date.getFullYear();
      this.month = date.getMonth() + 1;
      this.day = date.getDate();
      this.hour = date.getHours();
      this.minute = date.getMinutes();
      this.second = date.getSeconds();
    }
  }

  /** @internal */
  public static fromNumeric(datetime: number): DateTime {
    const year = Math.floor(datetime / 10000000000);
    const month = Math.floor((datetime % 10000000000) / 100000000);
    const day = Math.floor((datetime % 100000000) / 1000000);
    const hour = Math.floor((datetime % 1000000) / 10000);
    const minute = Math.floor((datetime % 10000) / 100);
    const second = datetime % 100;

    return new DateTime({ year, month, day, hour, minute, second });
  }

  /** @internal */
  public toNumeric(): number {
    return (
      this.year * 10000000000 +
      this.month * 100000000 +
      this.day * 1000000 +
      this.hour * 10000 +
      this.minute * 100 +
      this.second
    );
  }
}
