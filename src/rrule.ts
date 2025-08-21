import { DateTime, type DateTimeLike } from './datetime';
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
  January = 1,
  February = 2,
  March = 3,
  April = 4,
  May = 5,
  June = 6,
  July = 7,
  August = 8,
  September = 9,
  October = 10,
  November = 11,
  December = 12,
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

export interface RRuleOptions {
  readonly frequency: Frequency;
  readonly interval?: number;
  readonly count?: number;
  readonly until?: DateTime | DateTimeLike;
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

export interface RRuleLike {
  readonly frequency: Frequency;
  readonly interval?: number;
  readonly count?: number;
  readonly until?: DateTimeLike;
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

  /** @internal */
  private rust?: Rust;

  public constructor(options: RRuleOptions);
  public constructor(frequency: Frequency);
  public constructor(frequencyOrOptions: Frequency | RRuleOptions) {
    if (typeof frequencyOrOptions === 'object' && frequencyOrOptions !== null) {
      this.frequency = frequencyOrOptions.frequency ?? Frequency.Daily;
      this.interval = frequencyOrOptions.interval;
      this.until =
        frequencyOrOptions.until &&
        DateTime.fromPlain(frequencyOrOptions.until);
      this.count = frequencyOrOptions.count;
      this.byWeekday = frequencyOrOptions.byWeekday ?? [];
      this.byHour = frequencyOrOptions.byHour ?? [];
      this.byMinute = frequencyOrOptions.byMinute ?? [];
      this.bySecond = frequencyOrOptions.bySecond ?? [];
      this.byMonthday = frequencyOrOptions.byMonthday ?? [];
      this.bySetpos = frequencyOrOptions.bySetpos ?? [];
      this.byMonth = frequencyOrOptions.byMonth ?? [];
      this.byWeekno = frequencyOrOptions.byWeekno ?? [];
      this.byYearday = frequencyOrOptions.byYearday ?? [];
      this.weekstart = frequencyOrOptions.weekstart;
    } else {
      this.frequency = frequencyOrOptions;
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

  public static fromPlain(rrule: RRuleLike): RRule {
    return new this({
      frequency: rrule.frequency,
      interval: rrule.interval,
      until: rrule.until,
      count: rrule.count,
      byWeekday: rrule.byWeekday,
      byHour: rrule.byHour,
      byMinute: rrule.byMinute,
      bySecond: rrule.bySecond,
      byMonthday: rrule.byMonthday,
      bySetpos: rrule.bySetpos,
      byMonth: rrule.byMonth,
      byWeekno: rrule.byWeekno,
      byYearday: rrule.byYearday,
      weekstart: rrule.weekstart,
    });
  }

  /**
   * @internal
   */
  public static fromRust(rust: Rust): RRule {
    const rrule = new this({
      frequency: rust.frequency,
      interval: rust.interval ?? undefined,
      until: rust.until === null ? undefined : DateTime.fromNumeric(rust.until),
      count: rust.count ?? undefined,
      byWeekday: rust.byWeekday,
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

  /**
   * @internal
   */
  public static fromPlainOrInstance(rrule: RRule | RRuleLike): RRule {
    return rrule instanceof RRule ? rrule : this.fromPlain(rrule);
  }

  public setFrequency(frequency: Frequency): RRule {
    return new RRule({ ...this.toPlain(), frequency });
  }

  public setInterval(interval: number): RRule {
    return new RRule({ ...this.toPlain(), interval });
  }

  public setCount(count: number): RRule {
    return new RRule({ ...this.toPlain(), count });
  }

  public setByWeekday(weekdays: readonly (NWeekday | Weekday)[]): RRule {
    return new RRule({ ...this.toPlain(), byWeekday: weekdays });
  }

  public setByHour(hours: readonly number[]): RRule {
    return new RRule({ ...this.toPlain(), byHour: hours });
  }

  public setByMinute(minutes: readonly number[]): RRule {
    return new RRule({ ...this.toPlain(), byMinute: minutes });
  }

  public setBySecond(seconds: readonly number[]): RRule {
    return new RRule({ ...this.toPlain(), bySecond: seconds });
  }

  public setByMonthday(days: readonly number[]): RRule {
    return new RRule({ ...this.toPlain(), byMonthday: days });
  }

  public setBySetpos(poses: readonly number[]): RRule {
    return new RRule({ ...this.toPlain(), bySetpos: poses });
  }

  public setByMonth(months: readonly Month[]): RRule {
    return new RRule({ ...this.toPlain(), byMonth: months });
  }

  public setByWeekno(weekNumbers: readonly number[]): RRule {
    return new RRule({ ...this.toPlain(), byWeekno: weekNumbers });
  }

  public setByYearday(days: readonly number[]): RRule {
    return new RRule({ ...this.toPlain(), byYearday: days });
  }

  public setWeekstart(day: Weekday): RRule {
    return new RRule({ ...this.toPlain(), weekstart: day });
  }

  public setUntil(datetime: DateTime | DateTimeLike): RRule {
    return new RRule({ ...this.toPlain(), until: datetime });
  }

  public toString(): string {
    return this.toRust().toString();
  }

  /**
   * @internal
   */
  public toRust(): Rust {
    this.rust ??= new Rust(
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

    return this.rust;
  }

  public toPlain(): RRuleLike {
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
      until: this.until?.toPlain(),
    };
  }
}
