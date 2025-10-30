import {
  DateTime,
  type Time,
  type DateTimeLike,
  type DateLike,
} from './datetime';

export interface DtStartOptions<
  DT extends DateTime<Time> | DateTime<undefined>,
> {
  datetime: DT;
  tzid?: string;
}

export interface DtStartLike<DT extends DateTimeLike | DateLike> {
  datetime: DT;
  tzid?: string;
}

export class DtStart<
  DT extends DateTime<Time> | DateTime<undefined> = DateTime<Time>,
> {
  public readonly datetime: DT;
  public readonly tzid?: string;

  public constructor(datetime: DT, tzid?: string);
  public constructor(options: DtStartOptions<DT>);
  public constructor(
    datetimeOrOptions: DT | DtStartOptions<DT>,
    tzid?: string,
  ) {
    if ('datetime' in datetimeOrOptions) {
      this.datetime = datetimeOrOptions.datetime;
      this.tzid = datetimeOrOptions.tzid;
    } else {
      this.datetime = datetimeOrOptions;
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
      datetime: DateTime.fromPlain(plain.datetime),
      tzid: plain.tzid,
    });
  }

  public setTzid(tzid: string | undefined): DtStart<DT> {
    return new DtStart(this.datetime, tzid);
  }

  public setDatetime<NDT extends DateTime<Time> | DateTime<undefined>>(
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
      datetime: this.datetime.toPlain() as DTL,
      tzid: this.tzid,
    };
  }
}
