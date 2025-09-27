import {
  type Time,
  DateTime,
  type DateTimeLike,
  type DateLike,
} from './datetime';
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

export interface RRuleOptions<DT extends DateTime<Time> | DateTime<undefined>> {
  readonly frequency: Frequency;
  readonly interval?: number;
  readonly count?: number;
  readonly until?: DT;
  readonly byWeekday?: readonly (NWeekday | Weekday)[];
  readonly byHour?: readonly number[];
  readonly byMinute?: readonly number[];
  readonly bySecond?: readonly number[];
  readonly byMonthday?: readonly number[];
  readonly bySetpos?: readonly number[];
  readonly byMonth?: readonly Month[];
  readonly byWeekno?: readonly number[];
  readonly byYearday?: readonly number[];
  readonly weekstart?: Weekday;
}

export interface RRuleLike<DT extends DateTimeLike | DateLike> {
  readonly frequency: Frequency;
  readonly interval?: number;
  readonly count?: number;
  readonly until?: DT;
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

export class RRule<
  DT extends DateTime<Time> | DateTime<undefined> = DateTime<Time>,
> {
  public readonly frequency: Frequency;
  public readonly interval?: number;
  public readonly until?: DT;
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

  public constructor(frequency: Frequency);
  public constructor(options: RRuleOptions<DT>);
  public constructor(frequencyOrOptions: Frequency | RRuleOptions<DT>) {
    if (typeof frequencyOrOptions === 'object' && frequencyOrOptions !== null) {
      this.frequency = frequencyOrOptions.frequency;
      this.interval = frequencyOrOptions.interval;
      this.until = frequencyOrOptions.until;
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
  public static parse<DT extends DateTime<Time> | DateTime<undefined>>(
    str: string,
  ): RRule<DT> {
    const rust = Rust.parse(str);

    return this.fromRust(rust);
  }

  public static fromPlain(
    rrule: RRuleLike<DateTimeLike>,
  ): RRule<DateTime<Time>>;
  public static fromPlain(
    rrule: RRuleLike<DateLike>,
  ): RRule<DateTime<undefined>>;
  public static fromPlain(
    rrule: RRuleLike<DateTimeLike> | RRuleLike<DateLike>,
  ): RRule<DateTime<Time>> | RRule<DateTime<undefined>> {
    return new this({
      frequency: rrule.frequency,
      interval: rrule.interval,
      until: rrule.until && DateTime.fromPlain(rrule.until),
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
  public static fromRust<DT extends DateTime<Time> | DateTime<undefined>>(
    rust: Rust,
  ): RRule<DT> {
    const rrule = new this({
      frequency: rust.frequency,
      interval: rust.interval ?? undefined,
      until:
        rust.until === null ? undefined : DateTime.fromNumeric<DT>(rust.until),
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

  public setFrequency(frequency: Frequency): RRule<DT> {
    return new RRule({ ...this.toOptions(), frequency });
  }

  public setInterval(interval: number): RRule<DT> {
    return new RRule({ ...this.toOptions(), interval });
  }

  public setCount(count: number): RRule<DT> {
    return new RRule({ ...this.toOptions(), count });
  }

  public setByWeekday(weekdays: readonly (NWeekday | Weekday)[]): RRule<DT> {
    return new RRule({ ...this.toOptions(), byWeekday: weekdays });
  }

  public setByHour(hours: readonly number[]): RRule<DT> {
    return new RRule({ ...this.toOptions(), byHour: hours });
  }

  public setByMinute(minutes: readonly number[]): RRule<DT> {
    return new RRule({ ...this.toOptions(), byMinute: minutes });
  }

  public setBySecond(seconds: readonly number[]): RRule<DT> {
    return new RRule({ ...this.toOptions(), bySecond: seconds });
  }

  public setByMonthday(days: readonly number[]): RRule<DT> {
    return new RRule({ ...this.toOptions(), byMonthday: days });
  }

  public setBySetpos(poses: readonly number[]): RRule<DT> {
    return new RRule({ ...this.toOptions(), bySetpos: poses });
  }

  public setByMonth(months: readonly Month[]): RRule<DT> {
    return new RRule({ ...this.toOptions(), byMonth: months });
  }

  public setByWeekno(weekNumbers: readonly number[]): RRule<DT> {
    return new RRule({ ...this.toOptions(), byWeekno: weekNumbers });
  }

  public setByYearday(days: readonly number[]): RRule<DT> {
    return new RRule({ ...this.toOptions(), byYearday: days });
  }

  public setWeekstart(day: Weekday): RRule<DT> {
    return new RRule({ ...this.toOptions(), weekstart: day });
  }

  public setUntil(until: DT): RRule<DT> {
    return new RRule({ ...this.toOptions(), until });
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

  public toPlain(): RRuleLike<
    DT extends DateTime<Time> ? DateTimeLike : DateLike
  > {
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

  private toOptions(): RRuleOptions<DT> {
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
