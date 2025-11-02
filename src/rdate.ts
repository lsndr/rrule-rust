import {
  DateTime,
  type Time,
  type DateTimeLike,
  type DateLike,
} from './datetime';
import { RDate as Rust } from './lib';

/**
 * Options for creating an RDate instance.
 */
export interface RDateOptions<DT extends DateTime<Time> | DateTime<undefined>> {
  /** Array of date/time values to include in recurrence */
  values: DT[];
  /** Optional timezone identifier (e.g., "America/New_York") */
  tzid?: string;
}

/**
 * Plain object representation of RDate.
 */
export interface RDateLike<DT extends DateTimeLike | DateLike> {
  /** Array of date/time values to include in recurrence */
  values: DT[];
  /** Optional timezone identifier (e.g., "America/New_York") */
  tzid?: string;
}

/**
 * Represents recurrence dates (RDATE property) for a recurrence rule.
 *
 * RDate specifies additional date/time values that should be included in the
 * recurrence set. This is useful for adding extra occurrences that don't fit
 * the regular recurrence pattern.
 *
 * @example
 * ```typescript
 * // Create with single date
 * const rdate1 = new RDate(DateTime.date(2024, 1, 15));
 *
 * // Create with multiple dates
 * const rdate2 = new RDate([
 *   DateTime.date(2024, 1, 15),
 *   DateTime.date(2024, 1, 22)
 * ]);
 *
 * // Create with timezone
 * const rdate3 = new RDate({
 *   values: [DateTime.local(2024, 1, 15, 9, 0, 0)],
 *   tzid: "America/New_York"
 * });
 * ```
 */
export class RDate<
  DT extends DateTime<Time> | DateTime<undefined> = DateTime<Time>,
> {
  /** Array of date/time values to include in recurrence */
  public readonly values: DT[];
  /** Optional timezone identifier (e.g., "America/New_York") */
  public readonly tzid?: string;

  /** @internal */
  private rust?: Rust;

  public constructor(values: DT, tzid?: string);
  public constructor(values: DT[], tzid?: string);
  public constructor(options: RDateOptions<DT>);
  public constructor(
    valueOrValuesOrOptions: DT | DT[] | RDateOptions<DT>,
    tzid?: string,
  ) {
    if (
      Array.isArray(valueOrValuesOrOptions) ||
      valueOrValuesOrOptions instanceof DateTime
    ) {
      this.values = Array.isArray(valueOrValuesOrOptions)
        ? valueOrValuesOrOptions
        : [valueOrValuesOrOptions];
      this.tzid = tzid;
    } else {
      this.values = valueOrValuesOrOptions.values;
      this.tzid = valueOrValuesOrOptions.tzid;
    }
  }

  /**
   * @internal
   */
  public static fromRust<DT extends DateTime<Time> | DateTime<undefined>>(
    rust: Rust,
  ): RDate<DT> {
    const rrule = new this(
      rust.values.map((dt) => DateTime.fromNumeric<DT>(dt)),
      rust.tzid ?? undefined,
    );

    rrule.rust = rust;

    return rrule;
  }

  /**
   * Creates an RDate instance from a plain object representation.
   *
   * @param plain - Plain object with date/time values and optional timezone
   * @returns A new RDate instance
   *
   * @example
   * ```typescript
   * const plain = {
   *   values: [
   *     { year: 2024, month: 1, day: 15 },
   *     { year: 2024, month: 1, day: 22 }
   *   ],
   *   tzid: "America/New_York"
   * };
   * const rdate = RDate.fromPlain(plain);
   * ```
   */
  public static fromPlain(
    plain: RDateLike<DateTimeLike>,
  ): RDate<DateTime<Time>>;
  public static fromPlain(
    plain: RDateLike<DateLike>,
  ): RDate<DateTime<undefined>>;
  public static fromPlain(
    plain: RDateLike<DateTimeLike> | RDateLike<DateLike>,
  ): RDate<DateTime<Time>> | RDate<DateTime<undefined>> {
    return new this({
      values: plain.values.map((dt) => DateTime.fromPlain(dt)),
      tzid: plain.tzid,
    });
  }

  /**
   * Creates a new RDate instance with a different timezone.
   *
   * @param tzid - Timezone identifier (e.g., "America/New_York") or undefined
   * @returns A new RDate instance with the specified timezone
   *
   * @example
   * ```typescript
   * const rdate = new RDate([DateTime.date(2024, 1, 15)]);
   * const withTz = rdate.setTzid("America/New_York");
   * ```
   */
  public setTzid(tzid: string | undefined): RDate<DT> {
    return new RDate(this.values, tzid);
  }

  /**
   * Creates a new RDate instance with different date/time values.
   *
   * @param datetimes - Array of new date/time values
   * @returns A new RDate instance with the specified values
   *
   * @example
   * ```typescript
   * const rdate = new RDate([DateTime.date(2024, 1, 15)]);
   * const updated = rdate.setValues([
   *   DateTime.date(2024, 1, 15),
   *   DateTime.date(2024, 1, 22)
   * ]);
   * ```
   */
  public setValues<NDT extends DateTime<Time> | DateTime<undefined>>(
    datetimes: NDT[],
  ): RDate<NDT> {
    return new RDate(datetimes, this.tzid);
  }

  /**
   * Converts the RDate instance to a plain object representation.
   *
   * @returns A plain object with date/time values and optional timezone
   *
   * @example
   * ```typescript
   * const rdate = new RDate(
   *   [DateTime.date(2024, 1, 15), DateTime.date(2024, 1, 22)],
   *   "America/New_York"
   * );
   * const plain = rdate.toPlain();
   * // {
   * //   values: [
   * //     { year: 2024, month: 1, day: 15 },
   * //     { year: 2024, month: 1, day: 22 }
   * //   ],
   * //   tzid: "America/New_York"
   * // }
   * ```
   */
  public toPlain<
    DTL extends DateTimeLike | DateLike = DT extends DateTime<Time>
      ? DateTimeLike
      : DateLike,
  >(): RDateLike<DTL> {
    return {
      values: this.values.map((dt) => dt.toPlain()) as DTL[],
      tzid: this.tzid,
    };
  }

  /**
   * @internal
   */
  public toRust(): Rust {
    this.rust ??= new Rust(
      this.values.map((dt) => dt.toNumeric()),
      this.tzid,
    );

    return this.rust;
  }
}
