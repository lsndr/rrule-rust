import {
  DateTime,
  type Time,
  type DateTimeLike,
  type DateLike,
} from './datetime';
import { ExDate as Rust } from './lib';

export interface ExDateOptions<
  DT extends DateTime<Time> | DateTime<undefined>,
> {
  values: DT[];
  tzid?: string;
}

export interface ExDateLike<DT extends DateTimeLike | DateLike> {
  values: DT[];
  tzid?: string;
}

export class ExDate<
  DT extends DateTime<Time> | DateTime<undefined> = DateTime<Time>,
> {
  public readonly values: DT[];
  public readonly tzid?: string;

  /** @internal */
  private rust?: Rust;

  // TODO: support single DateTime for simplicity
  // new ExDate(DateTime.date(..)) instead of new ExDate([DateTime.date(..)])
  public constructor(values: DT[], tzid?: string);
  public constructor(options: ExDateOptions<DT>);
  public constructor(valuesOrOptions: DT[] | ExDateOptions<DT>, tzid?: string) {
    if (!Array.isArray(valuesOrOptions)) {
      this.values = valuesOrOptions.values;
      this.tzid = valuesOrOptions.tzid;
    } else {
      this.values = valuesOrOptions;
      this.tzid = tzid;
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

  public setTzid(tzid: string | undefined): ExDate<DT> {
    return new ExDate(this.values, tzid);
  }

  public setValues<NDT extends DateTime<Time> | DateTime<undefined>>(
    datetimes: NDT[],
  ): ExDate<NDT> {
    return new ExDate(datetimes, this.tzid);
  }

  public toPlain<
    DTL extends DateTimeLike | DateLike = DT extends DateTime<Time>
      ? DateTimeLike
      : DateLike,
  >(): ExDateLike<DTL> {
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
