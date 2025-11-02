import {
  DateTime,
  type Time,
  type DateTimeLike,
  type DateLike,
} from './datetime';

/**
 * Options for creating a DtStart instance.
 */
export interface DtStartOptions<
  DT extends DateTime<Time> | DateTime<undefined>,
> {
  /** The start date/time value */
  value: DT;
  /** Optional timezone identifier (e.g., "America/New_York") */
  tzid?: string;
}

/**
 * Plain object representation of DtStart.
 */
export interface DtStartLike<DT extends DateTimeLike | DateLike> {
  /** The start date/time value */
  value: DT;
  /** Optional timezone identifier (e.g., "America/New_York") */
  tzid?: string;
}

/**
 * Represents the start date/time for a recurrence rule (DTSTART property).
 *
 * DtStart defines when the recurrence pattern begins. It can optionally
 * include a timezone identifier for proper timezone handling.
 *
 * @example
 * ```typescript
 * // Create with DateTime and timezone
 * const dtstart = new DtStart(
 *   DateTime.local(2024, 1, 15, 9, 0, 0),
 *   "America/New_York"
 * );
 *
 * // Create with options object
 * const dtstart2 = new DtStart({
 *   value: DateTime.date(2024, 1, 15),
 *   tzid: "Europe/London"
 * });
 * ```
 */
export class DtStart<
  DT extends DateTime<Time> | DateTime<undefined> = DateTime<Time>,
> {
  /** The start date/time value */
  public readonly value: DT;
  /** Optional timezone identifier (e.g., "America/New_York") */
  public readonly tzid?: string;

  public constructor(value: DT, tzid?: string);
  public constructor(options: DtStartOptions<DT>);
  public constructor(valueOrOptions: DT | DtStartOptions<DT>, tzid?: string) {
    if ('value' in valueOrOptions) {
      this.value = valueOrOptions.value;
      this.tzid = valueOrOptions.tzid;
    } else {
      this.value = valueOrOptions;
      this.tzid = tzid;
    }
  }

  /**
   * Creates a DtStart instance from a plain object representation.
   *
   * @param plain - Plain object with date/time and optional timezone
   * @returns A new DtStart instance
   *
   * @example
   * ```typescript
   * const plain = {
   *   value: { year: 2024, month: 1, day: 15, hour: 9, minute: 0, second: 0, utc: false },
   *   tzid: "America/New_York"
   * };
   * const dtstart = DtStart.fromPlain(plain);
   * ```
   */
  public static fromPlain(
    plain: DtStartLike<DateTimeLike>,
  ): DtStart<DateTime<Time>>;
  public static fromPlain(
    plain: DtStartLike<DateLike>,
  ): DtStart<DateTime<undefined>>;
  public static fromPlain(
    plain: DtStartLike<DateTimeLike> | DtStartLike<DateLike>,
  ): DtStart<DateTime<Time>> | DtStart<DateTime<undefined>> {
    return new this({
      value: DateTime.fromPlain(plain.value),
      tzid: plain.tzid,
    });
  }

  /**
   * Creates a new DtStart instance with a different timezone.
   *
   * @param tzid - Timezone identifier (e.g., "America/New_York") or undefined
   * @returns A new DtStart instance with the specified timezone
   *
   * @example
   * ```typescript
   * const dtstart = new DtStart(DateTime.local(2024, 1, 15, 9, 0, 0));
   * const withTz = dtstart.setTzid("America/New_York");
   * ```
   */
  public setTzid(tzid: string | undefined): DtStart<DT> {
    return new DtStart(this.value, tzid);
  }

  /**
   * Creates a new DtStart instance with a different date/time value.
   *
   * @param datetime - The new date/time value
   * @returns A new DtStart instance with the specified value
   *
   * @example
   * ```typescript
   * const dtstart = new DtStart(DateTime.date(2024, 1, 15));
   * const newStart = dtstart.setValue(DateTime.local(2024, 2, 1, 10, 0, 0));
   * ```
   */
  public setValue<NDT extends DateTime<Time> | DateTime<undefined>>(
    datetime: NDT,
  ): DtStart<NDT> {
    return new DtStart(datetime, this.tzid);
  }

  /**
   * Converts the DtStart instance to a plain object representation.
   *
   * @returns A plain object with date/time and optional timezone
   *
   * @example
   * ```typescript
   * const dtstart = new DtStart(
   *   DateTime.local(2024, 1, 15, 9, 0, 0),
   *   "America/New_York"
   * );
   * const plain = dtstart.toPlain();
   * // {
   * //   value: { year: 2024, month: 1, day: 15, hour: 9, minute: 0, second: 0, utc: false },
   * //   tzid: "America/New_York"
   * // }
   * ```
   */
  public toPlain<
    DTL extends DateTimeLike | DateLike = DT extends DateTime<Time>
      ? DateTimeLike
      : DateLike,
  >(): DtStartLike<DTL> {
    return {
      value: this.value.toPlain() as DTL,
      tzid: this.tzid,
    };
  }
}
