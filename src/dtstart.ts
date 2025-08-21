import { DateTime, type DateTimeLike } from './datetime';

export interface DtStartOptions {
  datetime: DateTime | DateTimeLike;
  tzid?: string;
}

export interface DtStartLike {
  datetime: DateTimeLike;
  tzid?: string;
}

export class DtStart {
  public readonly datetime: DateTime;
  public readonly tzid?: string;

  public constructor(datetime: DateTime | DateTimeLike);
  public constructor(options: DtStartOptions);
  public constructor(
    datetimeOrOptions: DateTime | DateTimeLike | DtStartOptions,
  ) {
    if ('datetime' in datetimeOrOptions) {
      this.datetime = DateTime.fromPlainOrInstance(datetimeOrOptions.datetime);
      this.tzid = datetimeOrOptions.tzid;
    } else {
      this.datetime = DateTime.fromPlainOrInstance(datetimeOrOptions);
    }
  }

  public static fromPlain(plain: DtStartLike): DtStart {
    return new this(plain);
  }

  /** @internal */
  public static fromPlainOrInstance(dtstart: DtStart | DtStartLike): DtStart {
    return dtstart instanceof DtStart ? dtstart : this.fromPlain(dtstart);
  }

  public setTzid(tzid: string): DtStart {
    return new DtStart({
      datetime: this.datetime,
      tzid,
    });
  }

  public setDatetime(datetime: DateTime | DateTimeLike): DtStart {
    return new DtStart({
      datetime: DateTime.fromPlainOrInstance(datetime),
      tzid: this.tzid,
    });
  }

  public toPlain(): DtStartLike {
    return {
      datetime: this.datetime.toPlain(),
      tzid: this.tzid,
    };
  }
}
