import * as rust from './lib';

export class RRule {
  public rust: rust.RRule;

  constructor(frequency: rust.Frequency) {
    this.rust = new rust.RRule(frequency);
  }

  static parse(str: string): RRule {
    const rrule = rust.RRule.parse(str);

    return this.fromRust(rrule);
  }

  static fromRust(rust: rust.RRule) {
    const rrule = Object.create(this.prototype);
    Object.assign(rrule, { rust });

    return rrule;
  }

  get frequency(): rust.Frequency {
    return this.rust.frequency;
  }

  get interval(): number {
    return this.rust.interval;
  }

  get count(): number | undefined {
    return this.rust.count ?? undefined;
  }

  get byWeekday(): rust.NWeekday[] {
    return this.rust.byWeekday;
  }

  get byHour(): number[] {
    return this.rust.byHour;
  }

  get byMinute(): number[] {
    return this.rust.byMinute;
  }

  get bySecond(): number[] {
    return this.rust.bySecond;
  }

  get byMonthday(): number[] {
    return this.rust.byMonthday;
  }

  get bySetpos(): number[] {
    return this.rust.bySetpos;
  }

  get byMonth(): rust.Month[] {
    return this.rust.byMonth;
  }

  get byWeekno(): number[] {
    return this.rust.byWeekno;
  }

  get byYearday(): number[] {
    return this.rust.byYearday;
  }

  get weekstart(): rust.Weekday {
    return this.rust.weekstart;
  }

  get until(): number | undefined {
    return this.rust.until ?? undefined;
  }

  toString(): string {
    return this.rust.toString();
  }

  setInterval(interval: number): this {
    this.rust.setInterval(interval);

    return this;
  }

  setCount(count: number): this {
    this.rust.setCount(count);

    return this;
  }

  setByWeekday(weekdays: ReadonlyArray<rust.NWeekday | rust.Weekday>): this {
    this.rust.setByWeekday(weekdays);

    return this;
  }

  setByHour(hours: ReadonlyArray<number>): this {
    this.rust.setByHour(hours);

    return this;
  }

  setByMinute(minutes: ReadonlyArray<number>): this {
    this.rust.setByMinute(minutes);

    return this;
  }

  setBySecond(seconds: ReadonlyArray<number>): this {
    this.rust.setBySecond(seconds);

    return this;
  }

  setByMonthday(days: ReadonlyArray<number>): this {
    this.rust.setByMonthday(days);

    return this;
  }

  setBySetpos(poses: ReadonlyArray<number>): this {
    this.rust.setBySetpos(poses);

    return this;
  }

  setByMonth(months: ReadonlyArray<rust.Month>): this {
    this.rust.setByMonth(months);

    return this;
  }

  setByWeekno(weekNumbers: ReadonlyArray<number>): this {
    this.rust.setByWeekno(weekNumbers);

    return this;
  }

  setByYearday(days: ReadonlyArray<number>): this {
    this.rust.setByYearday(days);

    return this;
  }

  setWeekstart(day: rust.Weekday): this {
    this.rust.setWeekstart(day);

    return this;
  }

  setUntil(timestamp: number): this {
    this.rust.setUntil(timestamp, 'UTC');

    return this;
  }
}
