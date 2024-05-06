import { RRule } from './rrule';
import * as lib from './lib';

export class RRuleSet {
  public rust: lib.RRuleSet;

  constructor(dtstart: number, tzid: string) {
    const set = new lib.RRuleSet(dtstart, tzid);

    this.rust = set;
  }

  static parse(str: string) {
    const set = lib.RRuleSet.parse(str);

    return this.fromRust(set);
  }

  static fromRust(rust: lib.RRuleSet): RRuleSet {
    const set = Object.create(this.prototype);
    Object.assign(set, { rust });

    return set;
  }

  setFromString(str: string): this {
    this.rust.setFromString(str);

    return this;
  }

  toString(): string {
    return this.rust.toString();
  }

  addRrule(rrule: RRule) {
    this.rust.addRrule(rrule.rust);

    return this;
  }

  addExrule(rrule: RRule) {
    this.rust.addExrule(rrule.rust);

    return this;
  }

  addExdate(timestamp: number) {
    this.rust.addExdate(timestamp);

    return this;
  }

  addRdate(timestamp: number) {
    this.rust.addRdate(timestamp);

    return this;
  }

  get dtstart() {
    return this.rust.dtstart;
  }

  getRrules() {
    return this.rust.getRrules().map((rrule) => RRule.fromRust(rrule));
  }

  getExrules() {
    return this.rust.getExrules().map((rrule) => RRule.fromRust(rrule));
  }

  getExdates() {
    return this.rust.getExdates();
  }

  getRdates() {
    return this.rust.getRdates();
  }

  all(limit?: number) {
    return this.rust.all(limit);
  }

  between(after: number, before: number, inclusive?: boolean) {
    return this.rust.between(after, before, inclusive);
  }
}
