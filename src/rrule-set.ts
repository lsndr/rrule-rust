import { RRule, type RRuleLike } from './rrule';
import { type RRuleSetIterator, RRuleSet as Rust } from './lib';
import {
  type Time,
  DateTime,
  type DateTimeLike,
  type DateLike,
} from './datetime';
import { DtStart, type DtStartLike } from './dtstart';
import { ExDate, type ExDateLike } from './exdate';
import { RDate, type RDateLike } from './rdate';
import { OperationCache } from './cache';

/**
 * Interface for controlling caching behavior of RRuleSet operations.
 *
 * Caching is enabled by default and significantly improves performance when repeatedly
 * calling methods like `all()`, `between()`, or iterating over the same RRuleSet instance.
 * However, it may consume additional memory for large recurrence sets.
 *
 * @example
 * ```typescript
 * const rruleSet = new RRuleSet({
 *   dtstart: new DtStart(DateTime.local(2024, 1, 1, 9, 0, 0)),
 *   rrules: [new RRule({ frequency: Frequency.Daily, count: 100 })]
 * });
 *
 * // Disable caching if memory is a concern
 * rruleSet.cache.disable();
 *
 * // Enable caching for better performance
 * rruleSet.cache.enable();
 *
 * // Clear cached results
 * rruleSet.cache.clear();
 * ```
 */
export interface RRuleSetCache {
  /**
   * Indicates whether caching is currently disabled.
   * When `true`, all operations compute results fresh without storing them.
   */
  disabled: boolean;

  /**
   * Clears all cached results.
   * Use this method when you want to free memory while keeping caching enabled.
   */
  clear(): void;

  /**
   * Disables caching for all subsequent operations.
   * Existing cached results are preserved but not used. New operations will not cache results.
   */
  disable(): void;

  /**
   * Enables caching for all subsequent operations.
   * Operations will store and reuse results to improve performance.
   */
  enable(): void;
}

/**
 * Options for creating an RRuleSet instance.
 */
export interface RRuleSetOptions<
  DT extends DateTime<Time> | DateTime<undefined> = DateTime<Time>,
> {
  /** The start date/time for the recurrence set */
  readonly dtstart: DtStart<DT>;
  /** Array of recurrence rules to include */
  readonly rrules?: readonly RRule<DT>[];
  /** Array of recurrence rules to exclude */
  readonly exrules?: readonly RRule<DT>[];
  /** Array of exception dates to exclude */
  readonly exdates?: readonly ExDate<DT>[];
  /** Array of recurrence dates to include */
  readonly rdates?: readonly RDate<DT>[];
}

/**
 * Plain object representation of RRuleSet.
 */
export interface RRuleSetLike<DT extends DateTimeLike | DateLike> {
  /** The start date/time for the recurrence set */
  readonly dtstart: DtStartLike<DT>;
  /** Array of recurrence rules to include */
  readonly rrules: readonly RRuleLike<DT>[];
  /** Array of recurrence rules to exclude */
  readonly exrules: readonly RRuleLike<DT>[];
  /** Array of exception dates to exclude */
  readonly exdates: readonly ExDateLike<DT>[];
  /** Array of recurrence dates to include */
  readonly rdates: readonly RDateLike<DT>[];
}

/**
 * Represents a set of recurrence rules (RRuleSet) according to RFC 5545.
 *
 * RRuleSet combines multiple recurrence components:
 * - DTSTART: The start date/time
 * - RRULE: Rules for generating occurrences
 * - EXRULE: Rules for excluding occurrences
 * - RDATE: Additional dates to include
 * - EXDATE: Specific dates to exclude
 *
 * @example
 * ```typescript
 * // Weekly meeting on Mondays, excluding holidays
 * const rruleSet = new RRuleSet({
 *   dtstart: new DtStart(DateTime.local(2024, 1, 15, 9, 0, 0)),
 *   rrules: [
 *     new RRule({
 *       frequency: Frequency.Weekly,
 *       byWeekday: [Weekday.Monday]
 *     })
 *   ],
 *   exdates: [
 *     new ExDate([
 *       DateTime.date(2024, 1, 1),  // New Year
 *       DateTime.date(2024, 12, 25) // Christmas
 *     ])
 *   ]
 * });
 *
 * // Get first 10 occurrences
 * const occurrences = rruleSet.all(10);
 * ```
 */
export class RRuleSet<DT extends DateTime<Time> | DateTime<undefined>>
  implements Iterable<DateTime<Time> | DateTime<undefined>>
{
  /** The start date/time for the recurrence set */
  public readonly dtstart: DtStart<DT>;
  /** Array of recurrence rules to include */
  public readonly rrules: readonly RRule<DT>[];
  /** Array of recurrence rules to exclude */
  public readonly exrules: readonly RRule<DT>[];
  /** Array of exception dates to exclude */
  public readonly exdates: readonly ExDate<DT>[];
  /** Array of recurrence dates to include */
  public readonly rdates: readonly RDate<DT>[];

  private _cache: OperationCache = new OperationCache({
    disabled: false,
  });

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
   * Provides access to cache control for this RRuleSet instance.
   *
   * By default, caching is enabled to optimize repeated calls to methods like `all()`,
   * `between()`, and iteration. Use this property to control caching behavior based on
   * your performance and memory requirements.
   *
   * @example
   * ```typescript
   * const rruleSet = new RRuleSet({
   *   dtstart: new DtStart(DateTime.local(2024, 1, 1, 9, 0, 0)),
   *   rrules: [new RRule({ frequency: Frequency.Daily })]
   * });
   *
   * // Check if caching is disabled
   * console.log(rruleSet.cache.disabled); // false
   *
   * // Disable caching for memory-constrained environments
   * rruleSet.cache.disable();
   *
   * // Clear cached data to free memory
   * rruleSet.cache.clear();
   * ```
   */
  public get cache(): RRuleSetCache {
    return this._cache;
  }

  /**
   * Parses an RFC 5545 formatted string into an RRuleSet.
   *
   * @param str - RFC 5545 formatted string containing DTSTART, RRULE, etc.
   * @returns A new RRuleSet instance
   *
   * @example
   * ```typescript
   * const str = `DTSTART:20240115T090000
   * RRULE:FREQ=WEEKLY;BYDAY=MO
   * EXDATE:20240101,20241225`;
   * const rruleSet = RRuleSet.parse(str);
   * ```
   */
  public static parse<DT extends DateTime<Time> | DateTime<undefined>>(
    str: string,
  ): RRuleSet<DT> {
    return this.fromRust(Rust.parse(str));
  }

  /**
   * Creates an RRuleSet from a plain object representation.
   *
   * @param plain - Plain object with recurrence set properties
   * @returns A new RRuleSet instance
   *
   * @example
   * ```typescript
   * const plain = {
   *   dtstart: { value: { year: 2024, month: 1, day: 15, hour: 9, minute: 0, second: 0, utc: false } },
   *   rrules: [{ frequency: Frequency.Weekly, byWeekday: [Weekday.Monday], ... }],
   *   exrules: [],
   *   exdates: [],
   *   rdates: []
   * };
   * const rruleSet = RRuleSet.fromPlain(plain);
   * ```
   */
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
        value: DateTime.fromInt32Array<DT>(rust.dtstart),
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

  /**
   * Creates a new RRuleSet with a different start date/time.
   *
   * @param dtstart - The new start date/time
   * @returns A new RRuleSet instance
   *
   * @example
   * ```typescript
   * const rruleSet = new RRuleSet(new DtStart(DateTime.date(2024, 1, 15)));
   * const updated = rruleSet.setDtStart(new DtStart(DateTime.date(2024, 2, 1)));
   * ```
   */
  public setDtStart(dtstart: DtStart<DT>): RRuleSet<DT> {
    return new RRuleSet({
      ...this.toOptions(),
      dtstart: dtstart,
    });
  }

  /**
   * Creates a new RRuleSet with an additional recurrence rule.
   *
   * @param rrule - The recurrence rule to add
   * @returns A new RRuleSet instance
   *
   * @example
   * ```typescript
   * const rruleSet = new RRuleSet(new DtStart(DateTime.date(2024, 1, 15)));
   * const withRule = rruleSet.addRRule(new RRule(Frequency.Weekly));
   * ```
   */
  public addRRule<RRDT extends DT>(rrule: RRule<RRDT>): RRuleSet<DT> {
    return new RRuleSet({
      ...this.toOptions(),
      rrules: [...this.rrules, rrule],
    });
  }

  /**
   * Creates a new RRuleSet with a different set of recurrence rules.
   *
   * @param rrules - The new array of recurrence rules
   * @returns A new RRuleSet instance
   */
  public setRRules(rrules: readonly RRule<DT>[]): RRuleSet<DT> {
    return new RRuleSet({
      ...this.toOptions(),
      rrules: rrules,
    });
  }

  /**
   * Creates a new RRuleSet with an additional exclusion rule.
   *
   * @param rrule - The exclusion rule to add
   * @returns A new RRuleSet instance
   *
   * @example
   * ```typescript
   * const rruleSet = new RRuleSet({
   *   dtstart: new DtStart(DateTime.date(2024, 1, 15)),
   *   rrules: [new RRule(Frequency.Daily)]
   * });
   * // Exclude weekends
   * const noWeekends = rruleSet.addExRule(new RRule({
   *   frequency: Frequency.Weekly,
   *   byWeekday: [Weekday.Saturday, Weekday.Sunday]
   * }));
   * ```
   */
  public addExRule(rrule: RRule<DT>): RRuleSet<DT> {
    return new RRuleSet({
      ...this.toOptions(),
      exrules: [...this.exrules, rrule],
    });
  }

  /**
   * Creates a new RRuleSet with a different set of exclusion rules.
   *
   * @param rrules - The new array of exclusion rules
   * @returns A new RRuleSet instance
   */
  public setExRules(rrules: readonly RRule<DT>[]): RRuleSet<DT> {
    return new RRuleSet({
      ...this.toOptions(),
      exrules: rrules,
    });
  }

  /**
   * Creates a new RRuleSet with an additional exception date.
   *
   * @param exdate - The exception date(s) to add
   * @returns A new RRuleSet instance
   *
   * @example
   * ```typescript
   * const rruleSet = new RRuleSet({
   *   dtstart: new DtStart(DateTime.date(2024, 1, 15)),
   *   rrules: [new RRule(Frequency.Daily)]
   * });
   * // Exclude specific holidays
   * const withExceptions = rruleSet.addExDate(new ExDate([
   *   DateTime.date(2024, 1, 1),
   *   DateTime.date(2024, 12, 25)
   * ]));
   * ```
   */
  public addExDate(exdate: ExDate<DT>): RRuleSet<DT> {
    return new RRuleSet({
      ...this.toOptions(),
      exdates: [...this.exdates, exdate],
    });
  }

  /**
   * Creates a new RRuleSet with a different set of exception dates.
   *
   * @param exdates - The new array of exception dates
   * @returns A new RRuleSet instance
   */
  public setExDates(exdates: readonly ExDate<DT>[]): RRuleSet<DT> {
    return new RRuleSet({
      ...this.toOptions(),
      exdates: exdates,
    });
  }

  /**
   * Creates a new RRuleSet with an additional recurrence date.
   *
   * @param datetime - The recurrence date(s) to add
   * @returns A new RRuleSet instance
   *
   * @example
   * ```typescript
   * const rruleSet = new RRuleSet({
   *   dtstart: new DtStart(DateTime.date(2024, 1, 15)),
   *   rrules: [new RRule(Frequency.Weekly)]
   * });
   * // Add extra dates not covered by the rule
   * const withExtras = rruleSet.addRDate(new RDate([
   *   DateTime.date(2024, 2, 14), // Valentine's Day special
   *   DateTime.date(2024, 3, 17)  // St. Patrick's Day special
   * ]));
   * ```
   */
  public addRDate(datetime: RDate<DT>): RRuleSet<DT> {
    return new RRuleSet({
      ...this.toOptions(),
      rdates: [...this.rdates, datetime],
    });
  }

  /**
   * Creates a new RRuleSet with a different set of recurrence dates.
   *
   * @param datetimes - The new array of recurrence dates
   * @returns A new RRuleSet instance
   */
  public setRDates(datetimes: readonly RDate<DT>[]): RRuleSet<DT> {
    return new RRuleSet({
      ...this.toOptions(),
      rdates: datetimes,
    });
  }

  /**
   * Returns all the occurrences of the recurrence set.
   *
   * @param limit - Optional maximum number of occurrences to return
   * @returns Array of date/time occurrences
   *
   * @example
   * ```typescript
   * const rruleSet = new RRuleSet({
   *   dtstart: new DtStart(DateTime.date(2024, 1, 15)),
   *   rrules: [new RRule({ frequency: Frequency.Daily, count: 5 })]
   * });
   *
   * // Get all occurrences (limited by count in rule)
   * const all = rruleSet.all();
   *
   * // Get first 10 occurrences
   * const first10 = rruleSet.all(10);
   * ```
   */

  // TODO: add skip (?)
  public all(limit?: number): readonly DT[] {
    return this._cache.getOrCompute<DT[]>(`all:${limit}`, () =>
      DateTime.fromFlatInt32Array(this.toRust().all(limit)),
    );
  }

  /**
   * Returns all occurrences between two dates.
   *
   * @param after - The lower bound date (exclusive by default)
   * @param before - The upper bound date (exclusive by default)
   * @param inclusive - Whether to include the boundary dates in results
   * @returns Array of date/time occurrences in the range
   *
   * @example
   * ```typescript
   * const rruleSet = new RRuleSet({
   *   dtstart: new DtStart(DateTime.date(2024, 1, 1)),
   *   rrules: [new RRule(Frequency.Daily)]
   * });
   *
   * // Get occurrences in January 2024 (exclusive)
   * const january = rruleSet.between(
   *   DateTime.date(2024, 1, 1),
   *   DateTime.date(2024, 2, 1)
   * );
   *
   * // Get occurrences in January 2024 (inclusive)
   * const januaryInclusive = rruleSet.between(
   *   DateTime.date(2024, 1, 1),
   *   DateTime.date(2024, 1, 31),
   *   true
   * );
   * ```
   */
  public between(after: DT, before: DT, inclusive?: boolean): readonly DT[] {
    return this._cache.getOrCompute(
      `between:${after.toString()},${before.toString()},${inclusive}`,
      () =>
        DateTime.fromFlatInt32Array(
          this.toRust().between(
            after.toInt32Array(),
            before.toInt32Array(),
            inclusive,
          ),
        ),
    );
  }

  /**
   * Parses an RFC 5545 string and updates the RRuleSet.
   *
   * @param str - RFC 5545 formatted string
   * @returns A new RRuleSet instance parsed from the string
   *
   * @example
   * ```typescript
   * const rruleSet = new RRuleSet(new DtStart(DateTime.date(2024, 1, 15)));
   * const updated = rruleSet.setFromString(`DTSTART:20240201T090000
   * RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR`);
   * ```
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
      this.dtstart.value.toInt32Array(),
      this.dtstart.tzid,
      undefined,
      this.rrules.map((rrule) => rrule.toRust()),
      this.exrules.map((rrule) => rrule.toRust()),
      this.exdates.map((exdate) => exdate.toRust()),
      this.rdates.map((rdate) => rdate.toRust()),
    );

    return this.rust;
  }

  /**
   * Converts the RRuleSet to an RFC 5545 formatted string.
   *
   * @returns RFC 5545 formatted string representation
   *
   * @example
   * ```typescript
   * const rruleSet = new RRuleSet({
   *   dtstart: new DtStart(DateTime.date(2024, 1, 15)),
   *   rrules: [new RRule({ frequency: Frequency.Weekly, byWeekday: [Weekday.Monday] })]
   * });
   * console.log(rruleSet.toString());
   * // DTSTART:20240115
   * // RRULE:FREQ=WEEKLY;BYDAY=MO
   * ```
   */
  public toString(): string {
    return this.toRust().toString();
  }

  /**
   * Converts the RRuleSet to a plain object representation.
   *
   * @returns A plain object with all RRuleSet properties
   *
   * @example
   * ```typescript
   * const rruleSet = new RRuleSet({
   *   dtstart: new DtStart(DateTime.date(2024, 1, 15)),
   *   rrules: [new RRule(Frequency.Weekly)]
   * });
   * const plain = rruleSet.toPlain();
   * // Useful for serialization to JSON
   * const json = JSON.stringify(plain);
   * ```
   */
  public toPlain(): RRuleSetLike<
    DT extends DateTime<Time> ? DateTimeLike : DateLike
  >;
  public toPlain(): RRuleSetLike<DateTimeLike> | RRuleSetLike<DateLike> {
    return {
      dtstart: this.dtstart.toPlain(),
      rrules: this.rrules.map((rrule) => rrule.toPlain()),
      exrules: this.exrules.map((rrule) => rrule.toPlain()),
      exdates: this.exdates.map((rrule) => rrule.toPlain()),
      rdates: this.rdates.map((rrule) => rrule.toPlain()),
    };
  }

  /**
   * Returns an iterator for the recurrence set.
   *
   * This allows using RRuleSet with for-of loops and other iteration constructs.
   *
   * @returns An iterator over the occurrences
   *
   * @example
   * ```typescript
   * const rruleSet = new RRuleSet({
   *   dtstart: new DtStart(DateTime.date(2024, 1, 15)),
   *   rrules: [new RRule({ frequency: Frequency.Daily, count: 5 })]
   * });
   *
   * // Iterate over occurrences
   * for (const occurrence of rruleSet) {
   *   console.log(occurrence.toString());
   * }
   *
   * // Use with spread operator
   * const allOccurrences = [...rruleSet];
   * ```
   */
  public [Symbol.iterator](): Iterator<DT, any, any> {
    const cache = this._cache.getOrSet('iterator:data', {
      values: [] as DT[],
      done: false,
    });
    let cacheIndex = 0;

    let iterAndStore: [RRuleSetIterator, Int32Array] | undefined;

    const getIterAndStore = () => {
      return (iterAndStore ??= [
        this.toRust().iterator(cache.values.length),
        new Int32Array(7),
      ]);
    };

    return {
      next: () => {
        const cachedValue = cache.values[cacheIndex++];

        if (cachedValue) {
          return {
            done: false,
            value: cachedValue,
          };
        } else if (cache.done) {
          return {
            done: true as const,
            value: undefined,
          };
        }

        const [iter, store] = getIterAndStore();
        const next = iter.next(store);

        if (!next) {
          cache.done = true;

          return {
            done: true as const,
            value: undefined,
          };
        }

        const value = DateTime.fromInt32Array<DT>(next === true ? store : next);
        cache.values.push(value);

        return {
          done: false,
          value,
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
