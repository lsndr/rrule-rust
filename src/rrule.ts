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
  /**
   * The type of the recurrence rule.
   */
  public readonly frequency: Frequency;

  /**
   * Contains a positive integer representing at which intervals the recurrence rule repeats.
   *
   * If nothing is set, default value "1" is used.
   *
   * @default 1
   */
  public readonly interval?: number;

  /**
   * End date of rrule, that bounds the recurrence rule in an inclusive manner
   */
  public readonly until?: DateTime;

  /**
   * Number of occurrences at which to range-bound the recurrence.
   *
   * The "DTSTART" property value always counts as the first occurrence.
   * TODO: Check if this is correct.
   *
   * If nothing is set and "UNTIL" is not set, the "RRULE" is considered to repeat forever.
   */
  public readonly count?: number;
  public readonly byWeekday: readonly (NWeekday | Weekday)[];

  /**
   * Array of hours within a day.
   *
   * Possible values are 0 to 23.
   */
  public readonly byHour: readonly number[];

  /**
   * Array of minutes within a hour.
   *
   * Possible values are 0 to 59.
   */
  public readonly byMinute: readonly number[];

  /**
   * Array of seconds within a minute.
   *
   * Possible values are 0 to 60.
   */
  public readonly bySecond: readonly number[];

  /**
   * Array of days of the month.
   *
   * Valid values are 1 to 31 or -31 to -1.
   *
   * For example, -10 represents the tenth to the last day of the month.
   */
  public readonly byMonthday: readonly number[];

  /**
   * Array of numbers that corresponds to the nth occurrence within the set of recurrence instances specified by the rule.
   *
   * Possible values are 1 to 366 or -366 to -1.
   */
  public readonly bySetpos: readonly number[];

  /**
   * Array of months of the year that the rule applies to.
   *
   * Possible values are 1 to 12.
   */
  public readonly byMonth: readonly Month[];

  /**
   * Array of ordinals specifying weeks of the year.
   *
   * Possible values are 1 to 53 or -53 to -1. Week number one of the calendar year is the first week
   * that contains at least four (4) days in that calendar year.
   */
  public readonly byWeekno: readonly number[];

  /**
   * Array of days of the year.
   *
   * Possible values are 1 to 366 or -366 to -1.
   *
   * For example, -1 represents the last day of the year (December 31st) and -306 represents the 306th to the last day of the year (March 1st).
   */
  public readonly byYearday: readonly number[];

  /**
   * The day on which the workweek starts.
   * If nothing is set, the week starts on Monday.
   *
   * @default Weekday.Monday
   */
  public readonly weekstart?: Weekday;

  /** @internal */
  private rust?: Rust;

  public constructor(frequency: Frequency);
  public constructor(rrule?: Partial<RRuleLike>);
  public constructor(rruleOrFrequency: Frequency | Partial<RRuleLike> = {}) {
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
   * Parses a rrule string into an object.
   *
   * Examples:
   *
   * RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;BYDAY=MO,WE,FR;WKST=SU
   * RRULE:FREQ=MONTHLY;INTERVAL=2;COUNT=10;BYDAY=1SU,-1SU
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
   * Sets type of recurrence.
   */
  public setFrequency(frequency: Frequency): RRule {
    return new RRule({ ...this.toObject(), frequency });
  }

  /**
   * Sets a number at which intervals the recurrence rule repeats.
   * Only positive integers are allowed.
   *
   * @param {number} interval
   * @returns {RRule}
   */
  public setInterval(interval: number): RRule {
    return new RRule({ ...this.toObject(), interval });
  }

  /**
   * Sets the number of occurrences at which to range-bound the recurrence.
   *
   * The "DTSTART" property value always counts as the first occurrence.
   * TODO: Check if this is correct.
   */
  public setCount(count: number): RRule {
    return new RRule({ ...this.toObject(), count });
  }

  public setByWeekday(weekdays: readonly (NWeekday | Weekday)[]): RRule {
    return new RRule({ ...this.toObject(), byWeekday: weekdays });
  }

  /**
   * Sets array of hours within a day.
   *
   * Valid values are 0 to 23
   */
  public setByHour(hours: readonly number[]): RRule {
    return new RRule({ ...this.toObject(), byHour: hours });
  }

  /**
   * Sets array of minutes within a hour.
   *
   * Valid values are 0 to 59
   */
  public setByMinute(minutes: readonly number[]): RRule {
    return new RRule({ ...this.toObject(), byMinute: minutes });
  }

  /**
   * Sets array of seconds within a minute.
   *
   * Valid values are 0 to 60
   */
  public setBySecond(seconds: readonly number[]): RRule {
    return new RRule({ ...this.toObject(), bySecond: seconds });
  }

  /**
   * Sets array of days of the month.
   *
   * Valid values are 1 to 31 or -31 to -1.
   *
   * For example, -10 represents the tenth to the last day of the month.
   * The BYMONTHDAY rule part MUST NOT be specified when the FREQ rule part is set to WEEKLY.
   */
  public setByMonthday(days: readonly number[]): RRule {
    return new RRule({ ...this.toObject(), byMonthday: days });
  }

  /**
   * Sets array of numbers that corresponds to the nth occurrence within the set of recurrence instances specified by the rule.
   *
   * Valid values are 1 to 366 or -366 to -1.
   *
   * A set of recurrence instances starts at the beginning of the interval defined by the FREQ rule part.
   * It must only be used in conjunction with another BYxxx rule part.
   *
   * For example "the last work day of the month" could be represented as:
   *
   * ```
   * FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1
   * ```
   */
  public setBySetpos(poses: readonly number[]): RRule {
    return new RRule({ ...this.toObject(), bySetpos: poses });
  }

  /**
   * Sets the months of the year that the rule applies to.
   */
  public setByMonth(months: readonly Month[]): RRule {
    return new RRule({ ...this.toObject(), byMonth: months });
  }

  /**
   * Sets an array of ordinals specifying weeks of the year.
   *
   * Valid values are 1 to 53 or -53 to -1. This corresponds to weeks according to week numbering as defined in [ISO.8601.2004].
   * A week is defined as a seven day period, starting on the day of the week defined to be the week start.
   * Week number one of the calendar year is the first week that contains at least four (4) days in that calendar year.
   *
   * This rule part MUST NOT be used when the FREQ rule part is set to anything other than YEARLY.
   */
  public setByWeekno(weekNumbers: readonly number[]): RRule {
    return new RRule({ ...this.toObject(), byWeekno: weekNumbers });
  }

  /**
   * Sets arrays of days of the year.
   *
   * Valid values are 1 to 366 or -366 to -1.
   * For example, -1 represents the last day of the year (December 31st) and -306 represents the 306th to the last day of the year (March 1st).
   *
   * The BYYEARDAY rule part MUST NOT be specified when the FREQ rule part is set to DAILY, WEEKLY, or MONTHLY.
   */
  public setByYearday(days: readonly number[]): RRule {
    return new RRule({ ...this.toObject(), byYearday: days });
  }

  /**
   * Sets the day on which the workweek starts.
   *
   * This is significant when a WEEKLY "RRULE" has an interval greater than 1, and a BYDAY rule part is specified.
   * This is also significant when in a YEARLY "RRULE" when a BYWEEKNO rule part is specified.
   *
   * If nothing is set, the week starts on Monday.
   */
  public setWeekstart(day: Weekday): RRule {
    return new RRule({ ...this.toObject(), weekstart: day });
  }

  /**
   * Sets the end date of the RRule value that bounds
   * the recurrence rule in an inclusive manner
   *
   * If not present, and the COUNT rule part is also not present, the "RRULE" is considered to repeat forever.
   */
  public setUntil(datetime: DateTime): RRule {
    return new RRule({ ...this.toObject(), until: datetime });
  }

  /**
   * Creates a string representation of the RRule:
   *
   * Examples:
   *
   * RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;BYDAY=MO,WE,FR;WKST=SU
   * RRULE: FREQ=MONTHLY;INTERVAL=2;COUNT=10;BYDAY=1SU,-1SU
   * */
  public toString(): string {
    return this.toRust().toString();
  }

  /**
   * Converts RRule into a plain object, which is fully compatible with Luxon:
   *
   * ```typescript
   * luxon.DateTime.fromObject(rrule.toObject());
   * ```
   */
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
}
