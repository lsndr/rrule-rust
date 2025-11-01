import {
  DateTime,
  type Time,
  type DateTimeLike,
  type DateLike,
} from './datetime';

export interface DtStartOptions<
  DT extends DateTime<Time> | DateTime<undefined>,
> {
  value: DT;
  tzid?: string;
}

export interface DtStartLike<DT extends DateTimeLike | DateLike> {
  value: DT;
  tzid?: string;
}

export class DtStart<
  DT extends DateTime<Time> | DateTime<undefined> = DateTime<Time>,
> {
  public readonly value: DT;
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

  public setTzid(tzid: string | undefined): DtStart<DT> {
    return new DtStart(this.value, tzid);
  }

  public setValue<NDT extends DateTime<Time> | DateTime<undefined>>(
    datetime: NDT,
  ): DtStart<NDT> {
    return new DtStart(datetime, this.tzid);
  }

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
