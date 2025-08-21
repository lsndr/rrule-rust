import { RRule, type RRuleLike } from './rrule';
import { RRuleSet as Rust } from './lib';
import { DateTime, type DateTimeLike } from './datetime';
import { DtStart, type DtStartLike } from './dtstart';

export interface RRuleSetOptions {
  readonly dtstart: DtStart | DtStartLike;
  readonly rrules?: readonly (RRule | RRuleLike)[];
  readonly exrules?: readonly (RRule | RRuleLike)[];
  readonly exdates?: readonly (DateTime | DateTimeLike)[];
  readonly rdates?: readonly (DateTime | DateTimeLike)[];
}

export interface RRuleSetLike {
  readonly dtstart: DtStartLike;
  readonly rrules: readonly RRuleLike[];
  readonly exrules: readonly RRuleLike[];
  readonly exdates: readonly DateTimeLike[];
  readonly rdates: readonly DateTimeLike[];
}

export class RRuleSet implements Iterable<DateTime> {
  public readonly dtstart: DtStart;
  public readonly rrules: readonly RRule[];
  public readonly exrules: readonly RRule[];
  public readonly exdates: readonly DateTime[];
  public readonly rdates: readonly DateTime[];

  /** @internal */
  private rust?: Rust;

  public constructor(dtstart: DtStart | DtStartLike);
  public constructor(options: RRuleSetOptions);
  public constructor(
    optionsOrDtstart: DtStart | DtStartLike | RRuleSetOptions,
  ) {
    if ('dtstart' in optionsOrDtstart) {
      this.dtstart = DtStart.fromPlainOrInstance(optionsOrDtstart.dtstart);
      this.rrules = (optionsOrDtstart?.rrules ?? []).map(
        RRule.fromPlainOrInstance.bind(RRule),
      );
      this.exrules = (optionsOrDtstart?.exrules ?? []).map(
        RRule.fromPlainOrInstance.bind(RRule),
      );
      this.exdates = (optionsOrDtstart?.exdates ?? []).map(
        DateTime.fromPlainOrInstance.bind(DateTime),
      );
      this.rdates = (optionsOrDtstart?.rdates ?? []).map(
        DateTime.fromPlainOrInstance.bind(DateTime),
      );
    } else {
      this.dtstart = DtStart.fromPlainOrInstance(optionsOrDtstart);
      this.rrules = [];
      this.exrules = [];
      this.exdates = [];
      this.rdates = [];
    }
  }

  /**
   * Parses a string into an RRuleSet.
   */
  public static parse(str: string): RRuleSet {
    const rust = Rust.parse(str);

    return this.fromRust(rust);
  }

  public static fromPlain(plain: RRuleSetLike): RRuleSet {
    return new RRuleSet(plain);
  }

  /**
   * @internal
   */
  public static fromRust(rust: Rust): RRuleSet {
    const set = new RRuleSet({
      dtstart: new DtStart({
        datetime: DateTime.fromNumeric(rust.dtstart),
        tzid: rust.tzid ?? undefined,
      }),
      rrules: rust.rrules.map((rrule) => RRule.fromRust(rrule)),
      exrules: rust.exrules.map((rrule) => RRule.fromRust(rrule)),
      exdates: rust.exdates.map((datetime) => DateTime.fromNumeric(datetime)),
      rdates: rust.rdates.map((datetime) => DateTime.fromNumeric(datetime)),
    });

    set.rust = rust;

    return set;
  }

  public setDtstart(dtstart: DtStart | DtStartLike): RRuleSet {
    return new RRuleSet({
      ...this.toPlain(),
      dtstart: dtstart,
    });
  }

  public addRrule(rrule: RRule | RRuleLike): RRuleSet {
    return new RRuleSet({
      ...this.toPlain(),
      rrules: [...this.rrules, rrule],
    });
  }

  public setRrules(rrules: readonly (RRule | RRuleLike)[]): RRuleSet {
    return new RRuleSet({
      ...this.toPlain(),
      rrules: rrules,
    });
  }

  public addExrule(rrule: RRule | RRuleLike): RRuleSet {
    return new RRuleSet({
      ...this.toPlain(),
      exrules: [...this.exrules, rrule],
    });
  }

  public setExrules(rrules: readonly (RRule | RRuleLike)[]): RRuleSet {
    return new RRuleSet({
      ...this.toPlain(),
      exrules: rrules,
    });
  }

  public addExdate(datetime: DateTime | DateTimeLike): RRuleSet {
    return new RRuleSet({
      ...this.toPlain(),
      exdates: [...this.exdates, datetime],
    });
  }

  public setExdates(datetimes: readonly (DateTime | DateTimeLike)[]): RRuleSet {
    return new RRuleSet({
      ...this.toPlain(),
      exdates: datetimes,
    });
  }

  public addRdate(datetime: DateTime | DateTimeLike): RRuleSet {
    return new RRuleSet({
      ...this.toPlain(),
      rdates: [...this.rdates, datetime],
    });
  }

  public setRdates(datetimes: readonly (DateTime | DateTimeLike)[]): RRuleSet {
    return new RRuleSet({
      ...this.toPlain(),
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
    this.rust ??= new Rust(
      this.dtstart.datetime.toNumeric(),
      this.dtstart.tzid,
      this.rrules.map((rrule) => rrule.toRust()),
      this.exrules.map((rrule) => rrule.toRust()),
      this.exdates.map((datetime) => datetime.toNumeric()),
      this.rdates.map((datetime) => datetime.toNumeric()),
    );

    return this.rust;
  }

  public toString(): string {
    return this.toRust().toString();
  }

  /**
   * Converts the RRuleSet to a plain object.
   */
  public toPlain(): RRuleSetLike {
    return {
      dtstart: this.dtstart.toPlain(),
      rrules: this.rrules.map((rrule) => rrule.toPlain()),
      exrules: this.exrules.map((rrule) => rrule.toPlain()),
      exdates: this.exdates.map((rrule) => rrule.toPlain()),
      rdates: this.rdates.map((rrule) => rrule.toPlain()),
    };
  }

  public [Symbol.iterator](): Iterator<DateTime, any, any> {
    const iter = this.toRust().iterator();

    return {
      next: () => {
        const result = iter.next();

        if (result === null) {
          return {
            done: true as const,
            value: undefined,
          };
        }

        return {
          done: false,
          value: DateTime.fromNumeric(result),
        };
      },
    };
  }
}
