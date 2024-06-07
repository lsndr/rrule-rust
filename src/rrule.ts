import { DateTime } from './datetime';
import { RRule as Rust } from './lib';

export interface NWeekday {
  /**
   * If set, this represents the nth occurrence of the weekday.
   * Otherwise it represents every occurrence of the weekday.
   *
   * A negative value represents nth occurrence from the end.
   */
  n?: number;
  weekday: Weekday;
}

export enum Frequency {
  Yearly = 0,
  Monthly = 1,
  Weekly = 2,
  Daily = 3,
  Hourly = 4,
  Minutely = 5,
  Secondly = 6,
}

export enum Month {
  January = 0,
  February = 1,
  March = 2,
  April = 3,
  May = 4,
  June = 5,
  July = 6,
  August = 7,
  September = 8,
  October = 9,
  November = 10,
  December = 11,
}

export enum Weekday {
  Monday = 0,
  Tuesday = 1,
  Wednesday = 2,
  Thursday = 3,
  Friday = 4,
  Saturday = 5,
  Sunday = 6,
}

export interface RRuleLike {
  readonly frequency: Frequency;
  readonly interval?: number;
  readonly count?: number;
  readonly until?: DateTime;
  readonly byWeekday: readonly (NWeekday | Weekday)[];
  readonly byHour: readonly number[];
  readonly byMinute: readonly number[];
  readonly bySecond: readonly number[];
  readonly byMonthday: readonly number[];
  readonly bySetpos: readonly number[];
  readonly byMonth: readonly Month[];
  readonly byWeekno: readonly number[];
  readonly byYearday: readonly number[];
  readonly weekstart?: Weekday;
}

export class RRule {
  /** @internal */
  private rust?: Rust;

  public readonly frequency: Frequency;
  public readonly interval?: number;
  public readonly until?: DateTime;
  public readonly count?: number;
  public readonly byWeekday: readonly (NWeekday | Weekday)[];
  public readonly byHour: readonly number[];
  public readonly byMinute: readonly number[];
  public readonly bySecond: readonly number[];
  public readonly byMonthday: readonly number[];
  public readonly bySetpos: readonly number[];
  public readonly byMonth: readonly Month[];
  public readonly byWeekno: readonly number[];
  public readonly byYearday: readonly number[];
  public readonly weekstart?: Weekday;

  constructor(frequency: Frequency);
  constructor(rrule?: Partial<RRuleLike>);
  constructor(rruleOrFrequency: number | Partial<RRuleLike> = {}) {
    if (typeof rruleOrFrequency === 'object' && rruleOrFrequency !== null) {
      this.frequency = rruleOrFrequency.frequency ?? Frequency.Daily;
      this.interval = rruleOrFrequency.interval;
      this.until = rruleOrFrequency.until;
      this.count = rruleOrFrequency.count;
      this.byWeekday = rruleOrFrequency.byWeekday ?? [];
      this.byHour = rruleOrFrequency.byHour ?? [];
      this.byMinute = rruleOrFrequency.byMinute ?? [];
      this.bySecond = rruleOrFrequency.bySecond ?? [];
      this.byMonthday = rruleOrFrequency.byMonthday ?? [];
      this.bySetpos = rruleOrFrequency.bySetpos ?? [];
      this.byMonth = rruleOrFrequency.byMonth ?? [];
      this.byWeekno = rruleOrFrequency.byWeekno ?? [];
      this.byYearday = rruleOrFrequency.byYearday ?? [];
      this.weekstart = rruleOrFrequency.weekstart;
    } else {
      this.frequency = rruleOrFrequency;
      this.byWeekday = [];
      this.byHour = [];
      this.byMinute = [];
      this.bySecond = [];
      this.byMonthday = [];
      this.bySetpos = [];
      this.byMonth = [];
      this.byWeekno = [];
      this.byYearday = [];
    }
  }

  /**
   * Parses a string into an RRule.
   */
  public static parse(str: string): RRule {
    const rust = Rust.parse(str);

    return this.fromRust(rust);
  }

  /**
   * @internal
   */
  public static fromRust(rust: Rust) {
    const rrule = new this({
      frequency: rust.frequency,
      interval: rust.interval ?? undefined,
      until: rust.until === null ? undefined : DateTime.fromNumeric(rust.until),
      count: rust.count === null ? undefined : rust.count,
      byWeekday: rust.byDay,
      byHour: rust.byHour,
      byMinute: rust.byMinute,
      bySecond: rust.bySecond,
      byMonthday: rust.byMonthday,
      bySetpos: rust.bySetpos,
      byMonth: rust.byMonth,
      byWeekno: rust.byWeekno,
      byYearday: rust.byYearday,
      weekstart: rust.weekstart ?? undefined,
    });

    rrule.rust = rust;

    return rrule;
  }

  public setFrequency(frequency: Frequency): RRule {
    return new RRule({ ...this.toObject(), frequency });
  }

  public setInterval(interval: number): RRule {
    return new RRule({ ...this.toObject(), interval });
  }

  public setCount(count: number): RRule {
    return new RRule({ ...this.toObject(), count });
  }

  public setByWeekday(weekdays: readonly (NWeekday | Weekday)[]): RRule {
    return new RRule({ ...this.toObject(), byWeekday: weekdays });
  }

  public setByHour(hours: readonly number[]): RRule {
    return new RRule({ ...this.toObject(), byHour: hours });
  }

  public setByMinute(minutes: readonly number[]): RRule {
    return new RRule({ ...this.toObject(), byMinute: minutes });
  }

  public setBySecond(seconds: readonly number[]): RRule {
    return new RRule({ ...this.toObject(), bySecond: seconds });
  }

  public setByMonthday(days: readonly number[]): RRule {
    return new RRule({ ...this.toObject(), byMonthday: days });
  }

  public setBySetpos(poses: readonly number[]): RRule {
    return new RRule({ ...this.toObject(), bySetpos: poses });
  }

  public setByMonth(months: readonly Month[]): RRule {
    return new RRule({ ...this.toObject(), byMonth: months });
  }

  public setByWeekno(weekNumbers: readonly number[]): RRule {
    return new RRule({ ...this.toObject(), byWeekno: weekNumbers });
  }

  public setByYearday(days: readonly number[]): RRule {
    return new RRule({ ...this.toObject(), byYearday: days });
  }

  public setWeekstart(day: Weekday): RRule {
    return new RRule({ ...this.toObject(), weekstart: day });
  }

  public setUntil(datetime: DateTime): RRule {
    return new RRule({ ...this.toObject(), until: datetime });
  }

  public toString(): string {
    return this.toRust().toString();
  }

  /**
   * @internal
   */
  public toRust(): Rust {
    if (!this.rust) {
      this.rust = new Rust(
        this.frequency,
        this.interval,
        this.count,
        this.weekstart,
        this.until?.toNumeric(),
        this.byWeekday,
        this.byHour,
        this.byMinute,
        this.bySecond,
        this.byMonthday,
        this.bySetpos,
        this.byMonth,
        this.byWeekno,
        this.byYearday,
      );
    }

    return this.rust;
  }

  public toObject(): RRuleLike {
    return {
      frequency: this.frequency,
      interval: this.interval,
      count: this.count,
      byWeekday: this.byWeekday,
      byHour: this.byHour,
      byMinute: this.byMinute,
      bySecond: this.bySecond,
      byMonthday: this.byMonthday,
      bySetpos: this.bySetpos,
      byMonth: this.byMonth,
      byWeekno: this.byWeekno,
      byYearday: this.byYearday,
      weekstart: this.weekstart,
      until: this.until,
    };
  }
}
