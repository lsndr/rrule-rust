import { RRule as Rust, Frequency, NWeekday, Month, Weekday } from './lib';

export interface RRuleLike {
  readonly frequency: Frequency;
  readonly interval: number;
  readonly count?: number;
  readonly until?: number;
  readonly byWeekday: readonly (NWeekday | Weekday)[];
  readonly byHour: readonly number[];
  readonly byMinute: readonly number[];
  readonly bySecond: readonly number[];
  readonly byMonthday: readonly number[];
  readonly bySetpos: readonly number[];
  readonly byMonth: readonly Month[];
  readonly byWeekno: readonly number[];
  readonly byYearday: readonly number[];
  readonly weekstart: Weekday;
}

export class RRule {
  /** @internal */
  private rust?: Rust;

  public readonly frequency: Frequency;
  public readonly interval: number;
  public readonly until?: number;
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
  public readonly weekstart: Weekday;

  constructor(frequency: Frequency);
  constructor(rrule?: Partial<RRuleLike>);
  constructor(rruleOrFrequency: number | Partial<RRuleLike> = {}) {
    if (typeof rruleOrFrequency === 'object' && rruleOrFrequency !== null) {
      this.frequency = rruleOrFrequency.frequency ?? Frequency.Daily;
      this.interval = rruleOrFrequency.interval ?? 1;
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
      this.weekstart = rruleOrFrequency.weekstart ?? Weekday.Monday;
    } else {
      this.frequency = rruleOrFrequency;
      this.interval = 1;
      this.byWeekday = [];
      this.byHour = [];
      this.byMinute = [];
      this.bySecond = [];
      this.byMonthday = [];
      this.bySetpos = [];
      this.byMonth = [];
      this.byWeekno = [];
      this.byYearday = [];
      this.weekstart = Weekday.Monday;
    }
  }

  static parse(str: string): RRule {
    const rust = Rust.parse(str);

    return this.fromRust(rust);
  }

  /**
   * @internal
   */
  static fromRust(rust: Rust) {
    const rrule = new this({
      frequency: rust.frequency,
      interval: rust.interval,
      until: rust.until === null ? undefined : rust.until,
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
      weekstart: rust.weekstart,
    });

    rrule.rust = rust;

    return rrule;
  }

  setFrequency(frequency: Frequency): RRule {
    return new RRule({ ...this.toObject(), frequency });
  }

  setInterval(interval: number): RRule {
    return new RRule({ ...this.toObject(), interval });
  }

  setCount(count: number): RRule {
    return new RRule({ ...this.toObject(), count });
  }

  setByWeekday(weekdays: readonly (NWeekday | Weekday)[]): RRule {
    return new RRule({ ...this.toObject(), byWeekday: weekdays });
  }

  setByHour(hours: readonly number[]): RRule {
    return new RRule({ ...this.toObject(), byHour: hours });
  }

  setByMinute(minutes: readonly number[]): RRule {
    return new RRule({ ...this.toObject(), byMinute: minutes });
  }

  setBySecond(seconds: readonly number[]): RRule {
    return new RRule({ ...this.toObject(), bySecond: seconds });
  }

  setByMonthday(days: readonly number[]): RRule {
    return new RRule({ ...this.toObject(), byMonthday: days });
  }

  setBySetpos(poses: readonly number[]): RRule {
    return new RRule({ ...this.toObject(), bySetpos: poses });
  }

  setByMonth(months: readonly Month[]): RRule {
    return new RRule({ ...this.toObject(), byMonth: months });
  }

  setByWeekno(weekNumbers: readonly number[]): RRule {
    return new RRule({ ...this.toObject(), byWeekno: weekNumbers });
  }

  setByYearday(days: readonly number[]): RRule {
    return new RRule({ ...this.toObject(), byYearday: days });
  }

  setWeekstart(day: Weekday): RRule {
    return new RRule({ ...this.toObject(), weekstart: day });
  }

  setUntil(datetime: number): RRule {
    return new RRule({ ...this.toObject(), until: datetime });
  }

  toString(): string {
    return this.toRust().toString();
  }

  /**
   * @internal
   */
  public toRust(): Rust {
    if (!this.rust) {
      this.rust = Rust.create(
        this.frequency,
        this.interval,
        this.count,
        this.byWeekday,
        this.byHour,
        this.byMinute,
        this.bySecond,
        this.byMonthday,
        this.bySetpos,
        this.byMonth,
        this.byWeekno,
        this.byYearday,
        this.weekstart,
        this.until,
      );
    }

    return this.rust;
  }

  toObject(): RRuleLike {
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
