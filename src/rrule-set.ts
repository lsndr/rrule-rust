import { RRule } from './rrule';
import { RRuleSet as Rust } from './lib';
import { DateTime } from './datetime';

export interface RRuleSetLike {
  readonly dtstart: DateTime;
  readonly tzid: string;
  readonly rrules: readonly RRule[];
  readonly exrules: readonly RRule[];
  readonly exdates: readonly DateTime[];
  readonly rdates: readonly DateTime[];
}

export class RRuleSet implements Iterable<DateTime> {
  private rust?: Rust;

  public readonly dtstart: DateTime;
  public readonly tzid: string;
  public readonly rrules: readonly RRule[];
  public readonly exrules: readonly RRule[];
  public readonly exdates: readonly DateTime[];
  public readonly rdates: readonly DateTime[];

  constructor(dtstart: DateTime, tzid: string);
  constructor(options: Partial<RRuleSetLike>);
  constructor(setOrDtstart?: DateTime | Partial<RRuleSetLike>, tzid?: string) {
    if (!(setOrDtstart instanceof DateTime)) {
      if (setOrDtstart?.dtstart) {
        this.dtstart = setOrDtstart?.dtstart;
      } else {
        const date = new Date();

        this.dtstart = DateTime.create(
          date.getUTCFullYear(),
          date.getUTCMonth() + 1,
          date.getUTCDate(),
          date.getUTCHours(),
          date.getUTCMinutes(),
          date.getUTCSeconds(),
          true,
        );
      }

      this.tzid = setOrDtstart?.tzid ?? 'UTC';

      this.rrules = setOrDtstart?.rrules ?? [];
      this.exrules = setOrDtstart?.exrules ?? [];
      this.exdates = setOrDtstart?.exdates ?? [];
      this.rdates = setOrDtstart?.rdates ?? [];
    } else if (setOrDtstart instanceof DateTime && typeof tzid === 'string') {
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

  /**
   * Parses a string into an RRuleSet.
   */
  public static parse(str: string) {
    const rust = Rust.parse(str);

    return this.fromRust(rust);
  }

  /**
   * @internal
   */
  public static fromRust(rust: Rust): RRuleSet {
    const set = new RRuleSet({
      dtstart: DateTime.fromNumeric(rust.dtstart),
      tzid: rust.tzid,
      rrules: rust.rrules.map((rrule) => RRule.fromRust(rrule)),
      exrules: rust.exrules.map((rrule) => RRule.fromRust(rrule)),
      exdates: rust.exdates.map((datetime) => DateTime.fromNumeric(datetime)),
      rdates: rust.rdates.map((datetime) => DateTime.fromNumeric(datetime)),
    });

    set.rust = rust;

    return set;
  }

  public setDtstart(dtstart: DateTime): RRuleSet {
    return new RRuleSet({
      ...this.toObject(),
      dtstart: dtstart,
    });
  }

  public setTzid(tzid: string): RRuleSet {
    return new RRuleSet({
      ...this.toObject(),
      tzid: tzid,
    });
  }

  public addRrule(rrule: RRule): RRuleSet {
    return new RRuleSet({
      ...this.toObject(),
      rrules: [...this.rrules, rrule],
    });
  }

  public setRrules(rrules: readonly RRule[]): RRuleSet {
    return new RRuleSet({
      ...this.toObject(),
      rrules: rrules,
    });
  }

  public addExrule(rrule: RRule): RRuleSet {
    return new RRuleSet({
      ...this.toObject(),
      exrules: [...this.exrules, rrule],
    });
  }

  public setExrules(rrules: readonly RRule[]): RRuleSet {
    return new RRuleSet({
      ...this.toObject(),
      exrules: rrules,
    });
  }

  public addExdate(datetime: DateTime): RRuleSet {
    return new RRuleSet({
      ...this.toObject(),
      exdates: [...this.exdates, datetime],
    });
  }

  public setExdates(datetimes: readonly DateTime[]): RRuleSet {
    return new RRuleSet({
      ...this.toObject(),
      exdates: datetimes,
    });
  }

  public addRdate(datetime: DateTime): RRuleSet {
    return new RRuleSet({
      ...this.toObject(),
      rdates: [...this.rdates, datetime],
    });
  }

  public setRdates(datetimes: readonly DateTime[]): RRuleSet {
    return new RRuleSet({
      ...this.toObject(),
      rdates: datetimes,
    });
  }

  /**
   * Returns all the occurrences of the rrule.
   *
   * @param limit - The maximum number of occurrences to return.
   */
  public all(limit?: number): DateTime[] {
    return this.toRust()
      .all(limit)
      .map((datetime) => DateTime.fromNumeric(datetime));
  }

  /**
   * Returns all the occurrences of the rrule between after and before.
   *
   * @param after - The lower bound date.
   * @param before - The upper bound date.
   * @param inclusive - Whether to include after and before in the list of occurrences.
   */
  public between(
    after: DateTime,
    before: DateTime,
    inclusive?: boolean,
  ): DateTime[] {
    return this.toRust()
      .between(after.toNumeric(), before.toNumeric(), inclusive)
      .map((datetime) => DateTime.fromNumeric(datetime));
  }

  /**
   * Sets the RRuleSet from a string.
   *
   * @param str - The string to parse.
   */
  public setFromString(str: string): RRuleSet {
    return RRuleSet.fromRust(this.toRust().setFromString(str));
  }

  /**
   * @internal
   */
  public toRust(): Rust {
    if (!this.rust) {
      this.rust = Rust.create(
        this.dtstart.toNumeric(),
        this.tzid,
        this.rrules.map((rrule) => rrule.toRust()),
        this.exrules.map((rrule) => rrule.toRust()),
        this.exdates.map((datetime) => datetime.toNumeric()),
        this.rdates.map((datetime) => datetime.toNumeric()),
      );
    }

    return this.rust;
  }

  public toString(): string {
    return this.toRust().toString();
  }

  /**
   * Converts the RRuleSet to a plain object.
   */
  public toObject(): RRuleSetLike {
    return {
      dtstart: this.dtstart,
      tzid: this.tzid,
      rrules: this.rrules,
      exrules: this.exrules,
      exdates: this.exdates,
      rdates: this.rdates,
    };
  }

  public [Symbol.iterator]() {
    const iter = this.toRust().iter()[Symbol.iterator]();

    return {
      next: () => {
        const result = iter.next();

        if (result.done) {
          return result;
        }

        return {
          done: false,
          value: DateTime.fromNumeric(result.value),
        };
      },
    };
  }
}
