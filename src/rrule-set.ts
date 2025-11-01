import { RRule, type RRuleLike } from './rrule';
import { RRuleSet as Rust } from './lib';
import {
  type Time,
  DateTime,
  type DateTimeLike,
  type DateLike,
} from './datetime';
import { DtStart, type DtStartLike } from './dtstart';
import { ExDate, type ExDateLike } from './exdate';
import { RDate, type RDateLike } from './rdate';

export interface RRuleSetOptions<
  DT extends DateTime<Time> | DateTime<undefined> = DateTime<Time>,
> {
  readonly dtstart: DtStart<DT>;
  readonly rrules?: readonly RRule<DT>[];
  readonly exrules?: readonly RRule<DT>[];
  readonly exdates?: readonly ExDate<DT>[];
  readonly rdates?: readonly RDate<DT>[];
}

export interface RRuleSetLike<DT extends DateTimeLike | DateLike> {
  readonly dtstart: DtStartLike<DT>;
  readonly rrules: readonly RRuleLike<DT>[];
  readonly exrules: readonly RRuleLike<DT>[];
  readonly exdates: readonly ExDateLike<DT>[];
  readonly rdates: readonly RDateLike<DT>[];
}

export class RRuleSet<DT extends DateTime<Time> | DateTime<undefined>>
  implements Iterable<DateTime<Time> | DateTime<undefined>>
{
  public readonly dtstart: DtStart<DT>;
  public readonly rrules: readonly RRule<DT>[];
  public readonly exrules: readonly RRule<DT>[];
  public readonly exdates: readonly ExDate<DT>[];
  public readonly rdates: readonly RDate<DT>[];

  /** @internal */
  private rust?: Rust;

  public constructor(dtstart: DtStart<DT>);
  public constructor(options: RRuleSetOptions<DT>);
  public constructor(optionsOrDtstart: DtStart<DT> | RRuleSetOptions<DT>) {
    if ('dtstart' in optionsOrDtstart) {
      this.dtstart = optionsOrDtstart.dtstart;
      this.rrules = optionsOrDtstart?.rrules ?? [];
      this.exrules = optionsOrDtstart?.exrules ?? [];
      this.exdates = optionsOrDtstart?.exdates ?? [];
      this.rdates = optionsOrDtstart?.rdates ?? [];
    } else {
      this.dtstart = optionsOrDtstart;
      this.rrules = [];
      this.exrules = [];
      this.exdates = [];
      this.rdates = [];
    }
  }

  /**
   * Parses a string into an RRuleSet.
   */
  public static parse<DT extends DateTime<Time> | DateTime<undefined>>(
    str: string,
  ): RRuleSet<DT> {
    return this.fromRust(Rust.parse(str));
  }

  public static fromPlain(
    plain: RRuleSetLike<DateTimeLike>,
  ): RRuleSet<DateTime<Time>>;
  public static fromPlain(
    plain: RRuleSetLike<DateLike>,
  ): RRuleSet<DateTime<undefined>>;
  public static fromPlain(
    plain: RRuleSetLike<DateTimeLike> | RRuleSetLike<DateLike>,
  ): RRuleSet<DateTime<Time>> | RRuleSet<DateTime<undefined>> {
    return new RRuleSet({
      dtstart: DtStart.fromPlain(plain.dtstart),
      rrules: plain.rrules.map((rrule) => RRule.fromPlain(rrule)),
      exrules: plain.exrules.map((rrule) => RRule.fromPlain(rrule)),
      exdates: plain.exdates.map((datetime) => ExDate.fromPlain(datetime)),
      rdates: plain.rdates.map((datetime) => RDate.fromPlain(datetime)),
    });
  }

  /**
   * @internal
   */
  public static fromRust<DT extends DateTime<Time> | DateTime<undefined>>(
    rust: Rust,
  ): RRuleSet<DT> {
    const set = new RRuleSet<DT>({
      dtstart: new DtStart<DT>({
        value: DateTime.fromNumeric<DT>(rust.dtstart),
        tzid: rust.tzid ?? undefined,
      }),
      rrules: rust.rrules.map((rrule) => RRule.fromRust<DT>(rrule)),
      exrules: rust.exrules.map((rrule) => RRule.fromRust<DT>(rrule)),
      exdates: rust.exdates.map((exdate) => ExDate.fromRust<DT>(exdate)),
      rdates: rust.rdates.map((rdate) => RDate.fromRust<DT>(rdate)),
    });

    set.rust = rust;

    return set;
  }

  public setDtStart(dtstart: DtStart<DT>): RRuleSet<DT> {
    return new RRuleSet({
      ...this.toOptions(),
      dtstart: dtstart,
    });
  }

  public addRRule<RRDT extends DT>(rrule: RRule<RRDT>): RRuleSet<DT> {
    return new RRuleSet({
      ...this.toOptions(),
      rrules: [...this.rrules, rrule],
    });
  }

  public setRRules(rrules: readonly RRule<DT>[]): RRuleSet<DT> {
    return new RRuleSet({
      ...this.toOptions(),
      rrules: rrules,
    });
  }

  public addExRule(rrule: RRule<DT>): RRuleSet<DT> {
    return new RRuleSet({
      ...this.toOptions(),
      exrules: [...this.exrules, rrule],
    });
  }

  public setExRules(rrules: readonly RRule<DT>[]): RRuleSet<DT> {
    return new RRuleSet({
      ...this.toOptions(),
      exrules: rrules,
    });
  }

  public addExDate(exdate: ExDate<DT>): RRuleSet<DT> {
    return new RRuleSet({
      ...this.toOptions(),
      exdates: [...this.exdates, exdate],
    });
  }

  public setExDates(exdates: readonly ExDate<DT>[]): RRuleSet<DT> {
    return new RRuleSet({
      ...this.toOptions(),
      exdates: exdates,
    });
  }

  public addRDate(datetime: RDate<DT>): RRuleSet<DT> {
    return new RRuleSet({
      ...this.toOptions(),
      rdates: [...this.rdates, datetime],
    });
  }

  public setRDates(datetimes: readonly RDate<DT>[]): RRuleSet<DT> {
    return new RRuleSet({
      ...this.toOptions(),
      rdates: datetimes,
    });
  }

  /**
   * Returns all the occurrences of the rrule.
   *
   * @param limit - The maximum number of occurrences to return.
   */
  public all(limit?: number): DT[] {
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
  public between(after: DT, before: DT, inclusive?: boolean): DT[] {
    return this.toRust()
      .between(after.toNumeric(), before.toNumeric(), inclusive)
      .map((datetime) => DateTime.fromNumeric(datetime));
  }

  /**
   * Sets the RRuleSet from a string.
   *
   * @param str - The string to parse.
   */
  public setFromString<NDT extends DateTime<Time> | DateTime<undefined> = DT>(
    str: string,
  ): RRuleSet<NDT> {
    return RRuleSet.fromRust<NDT>(this.toRust().setFromString(str));
  }

  /**
   * @internal
   */
  public toRust(): Rust {
    this.rust ??= new Rust(
      this.dtstart.value.toNumeric(),
      this.dtstart.tzid,
      undefined,
      this.rrules.map((rrule) => rrule.toRust()),
      this.exrules.map((rrule) => rrule.toRust()),
      this.exdates.map((exdate) => exdate.toRust()),
      this.rdates.map((rdate) => rdate.toRust()),
    );

    return this.rust;
  }

  public toString(): string {
    return this.toRust().toString();
  }

  /**
   * Converts the RRuleSet to a plain object.
   */
  public toPlain(): RRuleSetLike<
    DT extends DateTime<Time> ? DateTimeLike : DateLike
  > {
    return {
      dtstart: this.dtstart.toPlain(),
      rrules: this.rrules.map((rrule) => rrule.toPlain()),
      exrules: this.exrules.map((rrule) => rrule.toPlain()),
      exdates: this.exdates.map((rrule) => rrule.toPlain()),
      rdates: this.rdates.map((rrule) => rrule.toPlain()),
    };
  }

  public [Symbol.iterator](): Iterator<DT, any, any> {
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

  private toOptions(): RRuleSetOptions<DT> {
    return {
      dtstart: this.dtstart,
      rrules: this.rrules,
      exrules: this.exrules,
      exdates: this.exdates,
      rdates: this.rdates,
    };
  }
}
