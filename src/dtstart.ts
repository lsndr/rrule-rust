import { DateTime, type DateTimeLike } from './datetime';

export interface DtStartOptions {
  datetime: DateTime;
  tzid?: string;
}

export interface DtStartLike {
  datetime: DateTimeLike;
  tzid?: string;
}

export class DtStart {
  public readonly datetime: DateTime;
  public readonly tzid?: string;

  public constructor(datetime: DateTime, tzid?: string);
  public constructor(options: DtStartOptions);
  public constructor(
    datetimeOrOptions: DateTime | DtStartOptions,
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

  public static fromPlain(plain: DtStartLike): DtStart {
    return new this({
      datetime: DateTime.fromPlain(plain.datetime),
      tzid: plain.tzid,
    });
  }

  public setTzid(tzid: string): DtStart {
    return new DtStart({
      datetime: this.datetime,
      tzid,
    });
  }

  public setDatetime(datetime: DateTime): DtStart {
    return new DtStart({
      datetime: datetime,
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
