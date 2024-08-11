/* tslint:disable */
/* eslint-disable */

/* auto-generated by NAPI-RS */

export enum Frequency {
  Yearly = 0,
  Monthly = 1,
  Weekly = 2,
  Daily = 3,
  Hourly = 4,
  Minutely = 5,
  Secondly = 6
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
  December = 12
}
export interface NWeekday {
  n?: number
  weekday: Weekday
}
export enum Weekday {
  Monday = 0,
  Tuesday = 1,
  Wednesday = 2,
  Thursday = 3,
  Friday = 4,
  Saturday = 5,
  Sunday = 6
}
export declare class RRule {
  constructor(frequency: Frequency, interval?: number | undefined | null, count?: number | undefined | null, weekstart?: Weekday | undefined | null, until?: number | undefined | null, byWeekday?: (readonly (NWeekday | Weekday)[]) | undefined | null, byHour?: (readonly number[]) | undefined | null, byMinute?: (readonly number[]) | undefined | null, bySecond?: (readonly number[]) | undefined | null, byMonthday?: (readonly number[]) | undefined | null, bySetpos?: (readonly number[]) | undefined | null, byMonth?: (readonly number[]) | undefined | null, byWeekno?: (readonly number[]) | undefined | null, byYearday?: (readonly number[]) | undefined | null)
  static parse(str: string): RRule
  get frequency(): Frequency
  get interval(): number | null
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
  get weekstart(): Weekday | null
  get until(): number | null
  toString(): string
}
export declare class RRuleSet {
  constructor(dtstart: number, tzid?: string | undefined | null, rrules?: (readonly RRule[]) | undefined | null, exrules?: (readonly RRule[]) | undefined | null, exdates?: (readonly number[]) | undefined | null, rdates?: (readonly number[]) | undefined | null)
  get tzid(): string | null
  get dtstart(): number
  get rrules(): RRule[]
  get exrules(): RRule[]
  get exdates(): number[]
  get rdates(): number[]
  static parse(str: string): RRuleSet
  all(limit?: number | undefined | null): number[]
  between(afterDatetime: number, beforeDatetime: number, inclusive?: boolean | undefined | null): number[]
  setFromString(str: string): this
  toString(): string
  iterator(): RRuleSetIterator
}
export declare class RRuleSetIterator {
  next(): number | null
}
