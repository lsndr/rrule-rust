import {
  type Time,
  DateTime,
  type DateTimeLike,
  type DateLike,
} from './datetime';
import { RRule as Rust } from './lib';

/**
 * Represents a weekday with an optional occurrence number.
 *
 * @example
 * ```typescript
 * // Every Monday
 * const everyMonday: NWeekday = { weekday: Weekday.Monday };
 *
 * // First Monday of the month
 * const firstMonday: NWeekday = { n: 1, weekday: Weekday.Monday };
 *
 * // Last Friday of the month
 * const lastFriday: NWeekday = { n: -1, weekday: Weekday.Friday };
 * ```
 */
export interface NWeekday {
  /**
   * If set, this represents the nth occurrence of the weekday.
   * Otherwise it represents every occurrence of the weekday.
   *
   * A negative value represents nth occurrence from the end.
   */
  n?: number;
  /** The weekday */
  weekday: Weekday;
}

/**
 * Recurrence frequency enumeration.
 */
export enum Frequency {
  Yearly = 0,
  Monthly = 1,
  Weekly = 2,
  Daily = 3,
  Hourly = 4,
  Minutely = 5,
  Secondly = 6,
}

/**
 * Month enumeration (1-based).
 */
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

/**
 * Weekday enumeration (0-based, Monday = 0).
 */
export enum Weekday {
  Monday = 0,
  Tuesday = 1,
  Wednesday = 2,
  Thursday = 3,
  Friday = 4,
  Saturday = 5,
  Sunday = 6,
}

/**
 * Options for creating an RRule instance.
 */
export interface RRuleOptions<DT extends DateTime<Time> | DateTime<undefined>> {
  /** How often the recurrence repeats */
  readonly frequency: Frequency;
  /** Interval between recurrences (e.g., 2 for every other occurrence) */
  readonly interval?: number;
  /** Maximum number of occurrences to generate */
  readonly count?: number;
  /** Date/time at which to end the recurrence */
  readonly until?: DT;
  /** List of weekdays when the recurrence should occur */
  readonly byWeekday?: readonly (NWeekday | Weekday)[];
  /** List of hours when the recurrence should occur (0-23) */
  readonly byHour?: readonly number[];
  /** List of minutes when the recurrence should occur (0-59) */
  readonly byMinute?: readonly number[];
  /** List of seconds when the recurrence should occur (0-59) */
  readonly bySecond?: readonly number[];
  /** List of days of the month when the recurrence should occur (1-31, negative for counting from end) */
  readonly byMonthday?: readonly number[];
  /** List of occurrence positions to include/exclude */
  readonly bySetpos?: readonly number[];
  /** List of months when the recurrence should occur */
  readonly byMonth?: readonly Month[];
  /** List of week numbers when the recurrence should occur (1-53, negative for counting from end) */
  readonly byWeekno?: readonly number[];
  /** List of days of the year when the recurrence should occur (1-366, negative for counting from end) */
  readonly byYearday?: readonly number[];
  /** Which day the week starts on */
  readonly weekstart?: Weekday;
}

/**
 * Plain object representation of RRule.
 */
export interface RRuleLike<DT extends DateTimeLike | DateLike> {
  /** How often the recurrence repeats */
  readonly frequency: Frequency;
  /** Interval between recurrences */
  readonly interval?: number;
  /** Maximum number of occurrences */
  readonly count?: number;
  /** Date/time at which to end the recurrence */
  readonly until?: DT;
  /** List of weekdays when the recurrence should occur */
  readonly byWeekday: readonly (NWeekday | Weekday)[];
  /** List of hours when the recurrence should occur (0-23) */
  readonly byHour: readonly number[];
  /** List of minutes when the recurrence should occur (0-59) */
  readonly byMinute: readonly number[];
  /** List of seconds when the recurrence should occur (0-59) */
  readonly bySecond: readonly number[];
  /** List of days of the month when the recurrence should occur */
  readonly byMonthday: readonly number[];
  /** List of occurrence positions to include/exclude */
  readonly bySetpos: readonly number[];
  /** List of months when the recurrence should occur */
  readonly byMonth: readonly Month[];
  /** List of week numbers when the recurrence should occur */
  readonly byWeekno: readonly number[];
  /** List of days of the year when the recurrence should occur */
  readonly byYearday: readonly number[];
  /** Which day the week starts on */
  readonly weekstart?: Weekday;
}

/**
 * Represents a recurrence rule (RRULE) according to RFC 5545.
 *
 * RRule defines a rule for generating recurring date/time values. It supports
 * various frequencies (yearly, monthly, weekly, etc.) and provides fine-grained
 * control through options like byWeekday, byMonth, byHour, etc.
 *
 * @example
 * ```typescript
 * // Daily recurrence
 * const daily = new RRule(Frequency.Daily);
 *
 * // Every weekday
 * const weekdays = new RRule({
 *   frequency: Frequency.Weekly,
 *   byWeekday: [Weekday.Monday, Weekday.Tuesday, Weekday.Wednesday, Weekday.Thursday, Weekday.Friday]
 * });
 *
 * // First Monday of each month, 10 times
 * const firstMonday = new RRule({
 *   frequency: Frequency.Monthly,
 *   byWeekday: [{ n: 1, weekday: Weekday.Monday }],
 *   count: 10
 * });
 *
 * // Every 2 weeks on Tuesday and Thursday
 * const biweekly = new RRule({
 *   frequency: Frequency.Weekly,
 *   interval: 2,
 *   byWeekday: [Weekday.Tuesday, Weekday.Thursday]
 * });
 * ```
 */
export class RRule<
  DT extends DateTime<Time> | DateTime<undefined> = DateTime<Time>,
> {
  /** How often the recurrence repeats */
  public readonly frequency: Frequency;
  /** Interval between recurrences */
  public readonly interval?: number;
  /** Date/time at which to end the recurrence */
  public readonly until?: DT;
  /** Maximum number of occurrences */
  public readonly count?: number;
  /** List of weekdays when the recurrence should occur */
  public readonly byWeekday: readonly (NWeekday | Weekday)[];
  /** List of hours when the recurrence should occur (0-23) */
  public readonly byHour: readonly number[];
  /** List of minutes when the recurrence should occur (0-59) */
  public readonly byMinute: readonly number[];
  /** List of seconds when the recurrence should occur (0-59) */
  public readonly bySecond: readonly number[];
  /** List of days of the month when the recurrence should occur */
  public readonly byMonthday: readonly number[];
  /** List of occurrence positions to include/exclude */
  public readonly bySetpos: readonly number[];
  /** List of months when the recurrence should occur */
  public readonly byMonth: readonly Month[];
  /** List of week numbers when the recurrence should occur */
  public readonly byWeekno: readonly number[];
  /** List of days of the year when the recurrence should occur */
  public readonly byYearday: readonly number[];
  /** Which day the week starts on */
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
   * Parses an RFC 5545 RRULE string into an RRule instance.
   *
   * @param str - RRULE string (e.g., "FREQ=DAILY;COUNT=10")
   * @returns A new RRule instance
   *
   * @example
   * ```typescript
   * const rrule = RRule.parse("FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=10");
   * ```
   */
  public static parse<DT extends DateTime<Time> | DateTime<undefined>>(
    str: string,
  ): RRule<DT> {
    const rust = Rust.parse(str);

    return this.fromRust(rust);
  }

  /**
   * Creates an RRule instance from a plain object representation.
   *
   * @param rrule - Plain object with recurrence rule properties
   * @returns A new RRule instance
   *
   * @example
   * ```typescript
   * const plain = {
   *   frequency: Frequency.Weekly,
   *   interval: 2,
   *   byWeekday: [Weekday.Monday, Weekday.Wednesday],
   *   count: 10,
   *   byHour: [],
   *   byMinute: [],
   *   bySecond: [],
   *   byMonthday: [],
   *   bySetpos: [],
   *   byMonth: [],
   *   byWeekno: [],
   *   byYearday: []
   * };
   * const rrule = RRule.fromPlain(plain);
   * ```
   */
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

  /**
   * Creates a new RRule with a different frequency.
   *
   * @param frequency - The new frequency
   * @returns A new RRule instance
   *
   * @example
   * ```typescript
   * const daily = new RRule(Frequency.Daily);
   * const weekly = daily.setFrequency(Frequency.Weekly);
   * ```
   */
  public setFrequency(frequency: Frequency): RRule<DT> {
    return new RRule({ ...this.toOptions(), frequency });
  }

  /**
   * Creates a new RRule with a different interval.
   *
   * @param interval - The new interval (e.g., 2 for every other occurrence)
   * @returns A new RRule instance
   *
   * @example
   * ```typescript
   * const rrule = new RRule(Frequency.Weekly);
   * const biweekly = rrule.setInterval(2); // Every 2 weeks
   * ```
   */
  public setInterval(interval: number): RRule<DT> {
    return new RRule({ ...this.toOptions(), interval });
  }

  /**
   * Creates a new RRule with a different count limit.
   *
   * @param count - Maximum number of occurrences
   * @returns A new RRule instance
   *
   * @example
   * ```typescript
   * const rrule = new RRule(Frequency.Daily);
   * const limited = rrule.setCount(10); // Only 10 occurrences
   * ```
   */
  public setCount(count: number): RRule<DT> {
    return new RRule({ ...this.toOptions(), count });
  }

  /**
   * Creates a new RRule with different weekday constraints.
   *
   * @param weekdays - List of weekdays or nth-weekday specifications
   * @returns A new RRule instance
   *
   * @example
   * ```typescript
   * const rrule = new RRule(Frequency.Weekly);
   * const weekdays = rrule.setByWeekday([Weekday.Monday, Weekday.Wednesday, Weekday.Friday]);
   *
   * // First and last Friday of the month
   * const fridays = rrule.setByWeekday([
   *   { n: 1, weekday: Weekday.Friday },
   *   { n: -1, weekday: Weekday.Friday }
   * ]);
   * ```
   */
  public setByWeekday(weekdays: readonly (NWeekday | Weekday)[]): RRule<DT> {
    return new RRule({ ...this.toOptions(), byWeekday: weekdays });
  }

  /**
   * Creates a new RRule with different hour constraints.
   *
   * @param hours - List of hours (0-23)
   * @returns A new RRule instance
   *
   * @example
   * ```typescript
   * const rrule = new RRule(Frequency.Daily);
   * const morningAndEvening = rrule.setByHour([9, 17]); // 9 AM and 5 PM
   * ```
   */
  public setByHour(hours: readonly number[]): RRule<DT> {
    return new RRule({ ...this.toOptions(), byHour: hours });
  }

  /**
   * Creates a new RRule with different minute constraints.
   *
   * @param minutes - List of minutes (0-59)
   * @returns A new RRule instance
   *
   * @example
   * ```typescript
   * const rrule = new RRule(Frequency.Hourly);
   * const quarterHours = rrule.setByMinute([0, 15, 30, 45]);
   * ```
   */
  public setByMinute(minutes: readonly number[]): RRule<DT> {
    return new RRule({ ...this.toOptions(), byMinute: minutes });
  }

  /**
   * Creates a new RRule with different second constraints.
   *
   * @param seconds - List of seconds (0-59)
   * @returns A new RRule instance
   */
  public setBySecond(seconds: readonly number[]): RRule<DT> {
    return new RRule({ ...this.toOptions(), bySecond: seconds });
  }

  /**
   * Creates a new RRule with different month day constraints.
   *
   * @param days - List of days (1-31, negative for counting from end)
   * @returns A new RRule instance
   *
   * @example
   * ```typescript
   * const rrule = new RRule(Frequency.Monthly);
   * const firstAndLast = rrule.setByMonthday([1, -1]); // First and last day of month
   * ```
   */
  public setByMonthday(days: readonly number[]): RRule<DT> {
    return new RRule({ ...this.toOptions(), byMonthday: days });
  }

  /**
   * Creates a new RRule with different set position constraints.
   *
   * @param poses - List of positions (1-based, negative for from end) to include after all other BY* parts
   * @returns A new RRule instance
   *
   * @example
   * ```typescript
   * // Get only the first occurrence from each monthly set of Mondays and Tuesdays.
   * // Without BYSETPOS this would include every Monday and Tuesday in every month.
   * const rrule = new RRule({
   *   frequency: Frequency.Monthly,
   *   byWeekday: [Weekday.Monday, Weekday.Tuesday]
   * });
   * const first = rrule.setBySetpos([1]);
   *
   * // Resulting RRULE string:
   * console.log(first.toString()); // "RRULE:FREQ=MONTHLY;BYDAY=MO,TU;BYSETPOS=1"
   *
   * // Effect:
   * // For each month, all Mondays and Tuesdays are collected, then only the earliest
   * // (the 1st in chronological order) is kept. This will usually be the first Monday
   * // of the month unless the month starts on a Tuesday (e.g., if the 1st is Tuesday).
   *
   * // Another example: keep the first and last matching weekday in each month.
   * const firstAndLast = rrule.setBySetpos([1, -1]);
   * console.log(firstAndLast.toString()); // "RRULE:FREQ=MONTHLY;BYDAY=MO,TU;BYSETPOS=1,-1"
   * ```
   */
  public setBySetpos(poses: readonly number[]): RRule<DT> {
    return new RRule({ ...this.toOptions(), bySetpos: poses });
  }

  /**
   * Creates a new RRule with different month constraints.
   *
   * @param months - List of months
   * @returns A new RRule instance
   *
   * @example
   * ```typescript
   * const rrule = new RRule(Frequency.Yearly);
   * const quarterly = rrule.setByMonth([Month.January, Month.April, Month.July, Month.October]);
   * ```
   */
  public setByMonth(months: readonly Month[]): RRule<DT> {
    return new RRule({ ...this.toOptions(), byMonth: months });
  }

  /**
   * Creates a new RRule with different week number constraints.
   *
   * @param weekNumbers - List of week numbers (1-53, negative for counting from end)
   * @returns A new RRule instance
   */
  public setByWeekno(weekNumbers: readonly number[]): RRule<DT> {
    return new RRule({ ...this.toOptions(), byWeekno: weekNumbers });
  }

  /**
   * Creates a new RRule with different year day constraints.
   *
   * @param days - List of days of the year (1-366, negative for counting from end)
   * @returns A new RRule instance
   *
   * @example
   * ```typescript
   * const rrule = new RRule(Frequency.Yearly);
   * const firstAndLastDay = rrule.setByYearday([1, -1]); // Jan 1 and Dec 31
   * ```
   */
  public setByYearday(days: readonly number[]): RRule<DT> {
    return new RRule({ ...this.toOptions(), byYearday: days });
  }

  /**
   * Creates a new RRule with a different week start day.
   *
   * @param day - The weekday that starts the week
   * @returns A new RRule instance
   *
   * @example
   * ```typescript
   * const rrule = new RRule(Frequency.Weekly);
   * const sundayStart = rrule.setWeekstart(Weekday.Sunday);
   * ```
   */
  public setWeekstart(day: Weekday): RRule<DT> {
    return new RRule({ ...this.toOptions(), weekstart: day });
  }

  /**
   * Creates a new RRule with a different end date.
   *
   * @param until - The date/time at which to end the recurrence
   * @returns A new RRule instance
   *
   * @example
   * ```typescript
   * const rrule = new RRule(Frequency.Daily);
   * const limited = rrule.setUntil(DateTime.date(2024, 12, 31));
   * ```
   */
  public setUntil(until: DT): RRule<DT> {
    return new RRule({ ...this.toOptions(), until });
  }

  /**
   * Converts the RRule to an RFC 5545 RRULE string.
   *
   * @returns RFC 5545 formatted string
   *
   * @example
   * ```typescript
   * const rrule = new RRule({
   *   frequency: Frequency.Weekly,
   *   byWeekday: [Weekday.Monday, Weekday.Wednesday],
   *   count: 10
   * });
   * console.log(rrule.toString()); // "RRULE:FREQ=WEEKLY;COUNT=10;BYDAY=MO,WE"
   * ```
   */
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

  /**
   * Converts the RRule to a plain object representation.
   *
   * @returns A plain object with all RRule properties
   *
   * @example
   * ```typescript
   * const rrule = new RRule({
   *   frequency: Frequency.Daily,
   *   count: 10
   * });
   * const plain = rrule.toPlain();
   * ```
   */
  public toPlain(): RRuleLike<
    DT extends DateTime<Time> ? DateTimeLike : DateLike
  >;
  public toPlain(): RRuleLike<DateTimeLike> | RRuleLike<DateLike> {
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
