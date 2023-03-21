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
export const enum Weekday {
  Monday = 0,
  Tuesday = 1,
  Wednesday = 2,
  Thursday = 3,
  Friday = 4,
  Saturday = 5,
  Sunday = 6
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
export type JsRRule = RRule
export class RRule {
  constructor(frequency: Frequency)
  get frequency(): Frequency
  get interval(): number
  get count(): number | null
  get byWeekday(): Weekday[]
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
  setByWeekday(weekdays: Weekday[]): this
  setByHour(hours: Array<number>): this
  setByMinute(minutes: Array<number>): this
  setBySecond(seconds: Array<number>): this
  setByMonthday(days: Array<number>): this
  setBySetpos(poses: Array<number>): this
  setByMonth(months: Month[]): this
  setByWeekno(weekNumbers: Array<number>): this
  setByYearday(days: Array<number>): this
  setWeekstart(day: Weekday): this
  setUntil(timestamp: number): this
}
export type JsRRuleSet = RRuleSet
export class RRuleSet {
  constructor(dtstart: number, tzid: string)
  toString(): string
  rrule(jsRrule: RRule): this
  exrule(jsRrule: RRule): this
  after(timestamp: number): this
  before(timestamp: number): this
  exdate(timestamp: number): this
  getDtstart(): number
  getTzid(): string
  all(limit?: number | undefined | null): number[]
}
