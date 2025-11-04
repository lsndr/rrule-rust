import {
  DateTime,
  type Time,
  type DateTimeLike,
  type DateLike,
} from './datetime';
import { ExDate as Rust } from './lib';

/**
 * Options for creating an ExDate instance.
 */
export interface ExDateOptions<
  DT extends DateTime<Time> | DateTime<undefined>,
> {
  /** Array of date/time values to exclude from recurrence */
  values: DT[];
  /** Optional timezone identifier (e.g., "America/New_York") */
  tzid?: string;
}

/**
 * Plain object representation of ExDate.
 */
export interface ExDateLike<DT extends DateTimeLike | DateLike> {
  /** Array of date/time values to exclude from recurrence */
  values: DT[];
  /** Optional timezone identifier (e.g., "America/New_York") */
  tzid?: string;
}

/**
 * Represents exception dates (EXDATE property) for a recurrence rule.
 *
 * ExDate specifies date/time values that should be excluded from the
 * recurrence set. This is useful for marking exceptions like holidays
 * or cancelled events in a recurring series.
 *
 * @example
 * ```typescript
 * // Create with single date
 * const exdate1 = new ExDate(DateTime.date(2024, 1, 15));
 *
 * // Create with multiple dates
 * const exdate2 = new ExDate([
 *   DateTime.date(2024, 1, 15),
 *   DateTime.date(2024, 1, 22)
 * ]);
 *
 * // Create with timezone
 * const exdate3 = new ExDate({
 *   values: [DateTime.local(2024, 1, 15, 9, 0, 0)],
 *   tzid: "America/New_York"
 * });
 * ```
 */
export class ExDate<
  DT extends DateTime<Time> | DateTime<undefined> = DateTime<Time>,
> {
  /** Array of date/time values to exclude from recurrence */
  public readonly values: DT[];
  /** Optional timezone identifier (e.g., "America/New_York") */
  public readonly tzid?: string;

  /** @internal */
  private rust?: Rust;

  public constructor(values: DT, tzid?: string);
  public constructor(values: DT[], tzid?: string);
  public constructor(options: ExDateOptions<DT>);
  public constructor(
    valueOrValuesOrOptions: DT | DT[] | ExDateOptions<DT>,
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
  ): ExDate<DT> {
    const rrule = new this(
      rust.values.map((dt) => DateTime.fromNumeric<DT>(dt)),
      rust.tzid ?? undefined,
    );

    rrule.rust = rust;

    return rrule;
  }

  /**
   * Creates an ExDate instance from a plain object representation.
   *
   * @param plain - Plain object with date/time values and optional timezone
   * @returns A new ExDate instance
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
   * const exdate = ExDate.fromPlain(plain);
   * ```
   */
  public static fromPlain(
    plain: ExDateLike<DateTimeLike>,
  ): ExDate<DateTime<Time>>;
  public static fromPlain(
    plain: ExDateLike<DateLike>,
  ): ExDate<DateTime<undefined>>;
  public static fromPlain(
    plain: ExDateLike<DateTimeLike> | ExDateLike<DateLike>,
  ): ExDate<DateTime<Time>> | ExDate<DateTime<undefined>> {
    return new this({
      values: plain.values.map((dt) => DateTime.fromPlain(dt)),
      tzid: plain.tzid,
    });
  }

  /**
   * Creates a new ExDate instance with a different timezone.
   *
   * @param tzid - Timezone identifier (e.g., "America/New_York") or undefined
   * @returns A new ExDate instance with the specified timezone
   *
   * @example
   * ```typescript
   * const exdate = new ExDate([DateTime.date(2024, 1, 15)]);
   * const withTz = exdate.setTzid("America/New_York");
   * ```
   */
  public setTzid(tzid: string | undefined): ExDate<DT> {
    return new ExDate(this.values, tzid);
  }

  /**
   * Creates a new ExDate instance with different date/time values.
   *
   * @param datetimes - Array of new date/time values
   * @returns A new ExDate instance with the specified values
   *
   * @example
   * ```typescript
   * const exdate = new ExDate([DateTime.date(2024, 1, 15)]);
   * const updated = exdate.setValues([
   *   DateTime.date(2024, 1, 15),
   *   DateTime.date(2024, 1, 22)
   * ]);
   * ```
   */
  public setValues<NDT extends DateTime<Time> | DateTime<undefined>>(
    datetimes: NDT[],
  ): ExDate<NDT> {
    return new ExDate(datetimes, this.tzid);
  }

  /**
   * Converts the ExDate instance to a plain object representation.
   *
   * @returns A plain object with date/time values and optional timezone
   *
   * @example
   * ```typescript
   * const exdate = new ExDate(
   *   [DateTime.date(2024, 1, 15), DateTime.date(2024, 1, 22)],
   *   "America/New_York"
   * );
   * const plain = exdate.toPlain();
   * // {
   * //   values: [
   * //     { year: 2024, month: 1, day: 15 },
   * //     { year: 2024, month: 1, day: 22 }
   * //   ],
   * //   tzid: "America/New_York"
   * // }
   * ```
   */
  public toPlain(): DT extends DateTime<Time>
    ? ExDateLike<DateTimeLike>
    : ExDateLike<DateLike>;
  public toPlain(): ExDateLike<DateTimeLike> | ExDateLike<DateLike> {
    return {
      values: this.values.map((dt) => dt.toPlain()),
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
