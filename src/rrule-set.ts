import { RRule } from './rrule';
import { RRuleSet as Rust } from './lib';
import { DateTime } from './datetime';

export interface RRuleSetLike {
  readonly dtstart: number;
  readonly tzid: string;
  readonly rrules: readonly RRule[];
  readonly exrules: readonly RRule[];
  readonly exdates: readonly number[];
  readonly rdates: readonly number[];
}

export class RRuleSet {
  private rust?: Rust;

  public readonly dtstart: number;
  public readonly tzid: string;
  public readonly rrules: readonly RRule[];
  public readonly exrules: readonly RRule[];
  public readonly exdates: readonly number[];
  public readonly rdates: readonly number[];

  constructor(dtstart: number, tzid: string);
  constructor(options: Partial<RRuleSetLike>);
  constructor(setOrDtstart?: number | Partial<RRuleSetLike>, tzid?: string) {
    if (typeof setOrDtstart === 'object' && setOrDtstart !== null) {
      this.dtstart = setOrDtstart?.dtstart ?? new DateTime().toNumeric();
      this.tzid = setOrDtstart?.tzid ?? 'UTC';

      this.rrules = setOrDtstart?.rrules ?? [];
      this.exrules = setOrDtstart?.exrules ?? [];
      this.exdates = setOrDtstart?.exdates ?? [];
      this.rdates = setOrDtstart?.rdates ?? [];
    } else if (typeof setOrDtstart === 'number' && typeof tzid === 'string') {
      this.dtstart = setOrDtstart;
      this.tzid = tzid;

      this.rrules = [];
      this.exrules = [];
      this.exdates = [];
      this.rdates = [];
    } else {
      throw new TypeError('Invalid arguments');
    }
  }

  static parse(str: string) {
    const rust = Rust.parse(str);

    return this.fromRust(rust);
  }

  /**
   * @internal
   */
  static fromRust(rust: Rust): RRuleSet {
    const set = new RRuleSet({
      dtstart: rust.dtstart,
      tzid: rust.tzid,
      rrules: rust.rrules.map((rrule) => RRule.fromRust(rrule)),
      exrules: rust.exrules.map((rrule) => RRule.fromRust(rrule)),
      exdates: rust.exdates,
      rdates: rust.rdates,
    });

    set.rust = rust;

    return set;
  }

  setDtstart(dtstart: number): RRuleSet {
    return new RRuleSet({
      ...this.toObject(),
      dtstart: dtstart,
    });
  }

  setTzid(tzid: string): RRuleSet {
    return new RRuleSet({
      ...this.toObject(),
      tzid: tzid,
    });
  }

  addRrule(rrule: RRule): RRuleSet {
    return new RRuleSet({
      ...this.toObject(),
      rrules: [...this.rrules, rrule],
    });
  }

  setRrules(rrules: readonly RRule[]): RRuleSet {
    return new RRuleSet({
      ...this.toObject(),
      rrules: rrules,
    });
  }

  addExrule(rrule: RRule): RRuleSet {
    return new RRuleSet({
      ...this.toObject(),
      exrules: [...this.exrules, rrule],
    });
  }

  setExrules(rrules: readonly RRule[]): RRuleSet {
    return new RRuleSet({
      ...this.toObject(),
      exrules: rrules,
    });
  }

  addExdate(datetime: number): RRuleSet {
    return new RRuleSet({
      ...this.toObject(),
      exdates: [...this.exdates, datetime],
    });
  }

  setExdates(datetimes: readonly number[]): RRuleSet {
    return new RRuleSet({
      ...this.toObject(),
      exdates: datetimes,
    });
  }

  addRdate(datetime: number): RRuleSet {
    return new RRuleSet({
      ...this.toObject(),
      rdates: [...this.rdates, datetime],
    });
  }

  setRdates(datetimes: readonly number[]): RRuleSet {
    return new RRuleSet({
      ...this.toObject(),
      rdates: datetimes,
    });
  }

  all(limit?: number) {
    return this.toRust().all(limit);
  }

  between(after: number, before: number, inclusive?: boolean) {
    return this.toRust().between(after, before, inclusive);
  }

  setFromString(str: string): RRuleSet {
    return RRuleSet.fromRust(this.toRust().setFromString(str));
  }

  /**
   * @internal
   */
  public toRust(): Rust {
    if (!this.rust) {
      this.rust = Rust.create(
        this.dtstart,
        this.tzid,
        this.rrules.map((rrule) => rrule.toRust()),
        this.exrules.map((rrule) => rrule.toRust()),
        this.exdates,
        this.rdates,
      );
    }

    return this.rust;
  }

  toString(): string {
    return this.toRust().toString();
  }

  toObject(): RRuleSetLike {
    return {
      dtstart: this.dtstart,
      tzid: this.tzid,
      rrules: this.rrules,
      exrules: this.exrules,
      exdates: this.exdates,
      rdates: this.rdates,
    };
  }
}
