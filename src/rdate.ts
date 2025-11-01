import {
  DateTime,
  type Time,
  type DateTimeLike,
  type DateLike,
} from './datetime';
import { RDate as Rust } from './lib';

export interface RDateOptions<DT extends DateTime<Time> | DateTime<undefined>> {
  values: DT[];
  tzid?: string;
}

export interface RDateLike<DT extends DateTimeLike | DateLike> {
  values: DT[];
  tzid?: string;
}

export class RDate<
  DT extends DateTime<Time> | DateTime<undefined> = DateTime<Time>,
> {
  public readonly values: DT[];
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

  public setTzid(tzid: string | undefined): RDate<DT> {
    return new RDate(this.values, tzid);
  }

  public setValues<NDT extends DateTime<Time> | DateTime<undefined>>(
    datetimes: NDT[],
  ): RDate<NDT> {
    return new RDate(datetimes, this.tzid);
  }

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
