/* tslint:disable */
/* eslint-disable */

/* auto-generated by NAPI-RS */

export const enum Frequency {
  Yearly = 0,
  Monthly = 1,
  Weekly = 2,
  Daily = 3,
  Hourly = 4,
  Minutely = 5,
  Secondly = 6
}
export const enum Month {
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
  December = 11
}
export interface NWeekday {
  /**
   * If set, this represents the nth occurrence of the weekday.
   * Otherwise it represents every occurrence of the weekday.
   *
   * A negative value represents nth occurrence from the end.
   */
  n?: number
  weekday: Weekday
}
export const enum Weekday {
  Monday = 0,
  Tuesday = 1,
  Wednesday = 2,
  Thursday = 3,
  Friday = 4,
  Saturday = 5,
  Sunday = 6
}
export class RRule {
  constructor(frequency: Frequency)
  static parse(str: string): RRule
  get frequency(): Frequency
  get interval(): number
  get count(): number | null
  get byWeekday(): NWeekday[]
  get byHour(): Array<number>
  get byMinute(): Array<number>
  get bySecond(): Array<number>
  get byMonthday(): Array<number>
  get bySetpos(): Array<number>
  get byMonth(): Month[]
  get byWeekno(): Array<number>
  get byYearday(): Array<number>
  get weekstart(): Weekday
  get until(): number | null
  toString(): string
  setInterval(interval: number): this
  setCount(count: number): this
  setByWeekday(weekdays: ReadonlyArray<NWeekday | Weekday>): this
  setByHour(hours: ReadonlyArray<number>): this
  setByMinute(minutes: ReadonlyArray<number>): this
  setBySecond(seconds: ReadonlyArray<number>): this
  setByMonthday(days: ReadonlyArray<number>): this
  setBySetpos(poses: ReadonlyArray<number>): this
  setByMonth(months: ReadonlyArray<Month>): this
  setByWeekno(weekNumbers: ReadonlyArray<number>): this
  setByYearday(days: ReadonlyArray<number>): this
  setWeekstart(day: Weekday): this
  setUntil(datetime: number, tzid: string): this
}
export class RRuleSet {
  constructor(dtstart: number, tzid: string)
  get dtstart(): number
  get rrules(): RRule[]
  get exrules(): RRule[]
  get exdates(): number[]
  get rdates(): number[]
  static parse(str: string): RRuleSet
  setFromString(str: string): this
  addRrule(rrule: RRule): this
  addExrule(rrule: RRule): this
  addExdate(datetime: number): this
  addRdate(datetime: number): this
  all(limit?: number | undefined | null): number[]
  between(afterDatetime: number, beforeDatetime: number, inclusive?: boolean | undefined | null): number[]
  toString(): string
}