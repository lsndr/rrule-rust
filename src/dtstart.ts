import {
  DateTime,
  type Time,
  type DateTimeLike,
  type DateLike,
} from './datetime';

export interface DtStartOptions {
  datetime: DateTime<Time> | DateTime<undefined>;
  tzid?: string;
}

export interface DtStartLike {
  datetime: DateTimeLike | DateLike;
  tzid?: string;
}

export class DtStart {
  public readonly datetime: DateTime<Time> | DateTime<undefined>;
  public readonly tzid?: string;

  public constructor(
    datetime: DateTime<Time> | DateTime<undefined>,
    tzid?: string,
  );
  public constructor(options: DtStartOptions);
  public constructor(
    datetimeOrOptions: DateTime<Time> | DateTime<undefined> | DtStartOptions,
    tzid?: string,
  ) {
    if ('datetime' in datetimeOrOptions) {
      this.datetime = datetimeOrOptions.datetime;
      this.tzid = datetimeOrOptions.tzid;
    } else {
      this.datetime = datetimeOrOptions;
      this.tzid = tzid!;
    }
  }

  public static fromPlain(plain: DtStartLike): DtStart {
    return new this({
      datetime: DateTime.fromPlain(plain.datetime),
      tzid: plain.tzid,
    });
  }

  public setTzid(tzid: string | undefined): DtStart {
    return new DtStart(this.datetime, tzid);
  }

  public setDatetime(datetime: DateTime<Time> | DateTime<undefined>): DtStart {
    return new DtStart(datetime, this.tzid);
  }

  public toPlain(): DtStartLike {
    return {
      datetime: this.datetime.toPlain(),
      tzid: this.tzid,
    };
  }
}
