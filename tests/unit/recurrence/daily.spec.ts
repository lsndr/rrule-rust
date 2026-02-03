import {
  RRule,
  RRuleSet,
  Frequency,
  Month,
  Weekday,
  DateTime,
  DtStart,
  ExDate,
} from '../../../src';
import { describe, it, expect } from 'vitest';

describe('Daily', () => {
  it('daily for 10 occurrences (date-only)', () => {
    const set = new RRuleSet(
      new DtStart({
        value: DateTime.date(1997, 9, 2),
        tzid: 'US/Eastern',
      }),
    ).addRRule(new RRule(Frequency.Daily).setCount(10));

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=US/Eastern:19970902\nRRULE:FREQ=DAILY;COUNT=10',
    );
    expect(dates).toEqualPlain([
      DateTime.date(1997, 9, 2),
      DateTime.date(1997, 9, 3),
      DateTime.date(1997, 9, 4),
      DateTime.date(1997, 9, 5),
      DateTime.date(1997, 9, 6),
      DateTime.date(1997, 9, 7),
      DateTime.date(1997, 9, 8),
      DateTime.date(1997, 9, 9),
      DateTime.date(1997, 9, 10),
      DateTime.date(1997, 9, 11),
    ]);
    expect([...set]).toEqualPlain(dates);
  });

  it('daily for 10 occurrences', () => {
    const rrule = new RRule(Frequency.Daily).setCount(10);
    const set = new RRuleSet(
      new DtStart({
        value: DateTime.create(1997, 9, 2, 9, 0, 0, false),
        tzid: 'US/Eastern',
      }),
    ).addRRule(rrule);

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;COUNT=10',
    );
    expect(dates).toEqualPlain([
      DateTime.create(1997, 9, 2, 9, 0, 0, false),
      DateTime.create(1997, 9, 3, 9, 0, 0, false),
      DateTime.create(1997, 9, 4, 9, 0, 0, false),
      DateTime.create(1997, 9, 5, 9, 0, 0, false),
      DateTime.create(1997, 9, 6, 9, 0, 0, false),
      DateTime.create(1997, 9, 7, 9, 0, 0, false),
      DateTime.create(1997, 9, 8, 9, 0, 0, false),
      DateTime.create(1997, 9, 9, 9, 0, 0, false),
      DateTime.create(1997, 9, 10, 9, 0, 0, false),
      DateTime.create(1997, 9, 11, 9, 0, 0, false),
    ]);
    expect([...set]).toEqualPlain(dates);
  });

  it('daily for 10 occurrences between 873550800000 and 873723600000 inclusively', () => {
    const rrule = new RRule(Frequency.Daily).setCount(10);
    const set = new RRuleSet(
      new DtStart({
        value: DateTime.create(1997, 9, 2, 9, 0, 0, false),
        tzid: 'US/Eastern',
      }),
    ).addRRule(rrule);

    const dates = set.between(
      DateTime.create(1997, 9, 6, 9, 0, 0, false),
      DateTime.create(1997, 9, 8, 9, 0, 0, false),
      true,
    );
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;COUNT=10',
    );
    expect(dates).toEqualPlain([
      DateTime.create(1997, 9, 6, 9, 0, 0, false),
      DateTime.create(1997, 9, 7, 9, 0, 0, false),
      DateTime.create(1997, 9, 8, 9, 0, 0, false),
    ]);
  });

  it('daily for 10 occurrences between 873550800000 and 873723600000 exclusively', () => {
    const rrule = new RRule(Frequency.Daily).setCount(10);
    const set = new RRuleSet(
      new DtStart({
        value: DateTime.create(1997, 9, 2, 9, 0, 0, false),
        tzid: 'US/Eastern',
      }),
    ).addRRule(rrule);

    const dates = set.between(
      DateTime.create(1997, 9, 6, 9, 0, 0, false),
      DateTime.create(1997, 9, 8, 9, 0, 0, false),
      false,
    );
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;COUNT=10',
    );
    expect(dates).toEqualPlain([DateTime.create(1997, 9, 7, 9, 0, 0, false)]);
    expect(dates[0]?.toDate()).toEqual(
      new Date(Date.UTC(1997, 8, 7, 13, 0, 0)),
    );
  });

  it('daily until September 6, 1997', () => {
    const rrule = new RRule(Frequency.Daily).setUntil(
      DateTime.create(1997, 9, 6, 9, 0, 0, false),
    );
    const set = new RRuleSet(
      new DtStart({
        value: DateTime.create(1997, 9, 2, 9, 0, 0, false),
        tzid: 'US/Eastern',
      }),
    ).addRRule(rrule);

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;UNTIL=19970906T090000',
    );
    expect(dates).toEqualPlain([
      DateTime.create(1997, 9, 2, 9, 0, 0, false),
      DateTime.create(1997, 9, 3, 9, 0, 0, false),
      DateTime.create(1997, 9, 4, 9, 0, 0, false),
      DateTime.create(1997, 9, 5, 9, 0, 0, false),
      DateTime.create(1997, 9, 6, 9, 0, 0, false),
    ]);
    expect([...set]).toEqualPlain(dates);
  });

  it('every other day', () => {
    const rrule = new RRule(Frequency.Daily).setCount(6).setInterval(2);
    const set = new RRuleSet(
      new DtStart({
        value: DateTime.create(1997, 9, 2, 9, 0, 0, false),
        tzid: 'US/Eastern',
      }),
    ).addRRule(rrule);

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;INTERVAL=2;COUNT=6',
    );
    expect(dates).toEqualPlain([
      DateTime.create(1997, 9, 2, 9, 0, 0, false),
      DateTime.create(1997, 9, 4, 9, 0, 0, false),
      DateTime.create(1997, 9, 6, 9, 0, 0, false),
      DateTime.create(1997, 9, 8, 9, 0, 0, false),
      DateTime.create(1997, 9, 10, 9, 0, 0, false),
      DateTime.create(1997, 9, 12, 9, 0, 0, false),
    ]);
    expect([...set]).toEqualPlain(dates);
  });

  it('every 10 days, 5 occurrences', () => {
    const rrule = new RRule(Frequency.Daily).setCount(5).setInterval(10);
    const set = new RRuleSet(
      new DtStart({
        value: DateTime.create(1997, 9, 2, 9, 0, 0, false),
        tzid: 'US/Eastern',
      }),
    ).addRRule(rrule);

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;INTERVAL=10;COUNT=5',
    );
    expect(dates).toEqualPlain([
      DateTime.create(1997, 9, 2, 9, 0, 0, false),
      DateTime.create(1997, 9, 12, 9, 0, 0, false),
      DateTime.create(1997, 9, 22, 9, 0, 0, false),
      DateTime.create(1997, 10, 2, 9, 0, 0, false),
      DateTime.create(1997, 10, 12, 9, 0, 0, false),
    ]);
    expect([...set]).toEqualPlain(dates);
  });

  it('every Monday in January, for 3 years', () => {
    const rrule = new RRule(Frequency.Daily)
      .setByMonth([Month.January])
      .setByWeekday([Weekday.Monday])
      .setUntil(DateTime.create(2000, 1, 31, 14, 0, 0, false));
    const set = new RRuleSet(
      new DtStart({
        value: DateTime.create(1997, 9, 2, 9, 0, 0, false),
        tzid: 'US/Eastern',
      }),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;UNTIL=20000131T140000;BYMONTH=1;BYDAY=MO',
    );
    expect(dates).toEqualPlain([
      DateTime.create(1998, 1, 5, 9, 0, 0, false),
      DateTime.create(1998, 1, 12, 9, 0, 0, false),
      DateTime.create(1998, 1, 19, 9, 0, 0, false),
      DateTime.create(1998, 1, 26, 9, 0, 0, false),
      DateTime.create(1999, 1, 4, 9, 0, 0, false),
      DateTime.create(1999, 1, 11, 9, 0, 0, false),
      DateTime.create(1999, 1, 18, 9, 0, 0, false),
      DateTime.create(1999, 1, 25, 9, 0, 0, false),
      DateTime.create(2000, 1, 3, 9, 0, 0, false),
      DateTime.create(2000, 1, 10, 9, 0, 0, false),
      DateTime.create(2000, 1, 17, 9, 0, 0, false),
      DateTime.create(2000, 1, 24, 9, 0, 0, false),
      DateTime.create(2000, 1, 31, 9, 0, 0, false),
    ]);
    expect([...set]).toEqualPlain(dates);
  });

  it('every Monday in January, for 3 years except Jan 31 2000', () => {
    const rrule = new RRule(Frequency.Daily)
      .setByMonth([Month.January])
      .setByWeekday([Weekday.Monday])
      .setUntil(DateTime.create(2000, 1, 31, 14, 0, 0, false));

    const set = new RRuleSet(
      new DtStart({
        value: DateTime.create(1997, 9, 2, 9, 0, 0, false),
        tzid: 'Asia/Tbilisi',
      }),
    )
      .addRRule(rrule)
      .addExDate(new ExDate([DateTime.create(2000, 1, 31, 9, 0, 0, false)]));

    const dates = set.all();

    expect(dates).toEqualPlain([
      DateTime.create(1998, 1, 5, 9, 0, 0, false),
      DateTime.create(1998, 1, 12, 9, 0, 0, false),
      DateTime.create(1998, 1, 19, 9, 0, 0, false),
      DateTime.create(1998, 1, 26, 9, 0, 0, false),
      DateTime.create(1999, 1, 4, 9, 0, 0, false),
      DateTime.create(1999, 1, 11, 9, 0, 0, false),
      DateTime.create(1999, 1, 18, 9, 0, 0, false),
      DateTime.create(1999, 1, 25, 9, 0, 0, false),
      DateTime.create(2000, 1, 3, 9, 0, 0, false),
      DateTime.create(2000, 1, 10, 9, 0, 0, false),
      DateTime.create(2000, 1, 17, 9, 0, 0, false),
      DateTime.create(2000, 1, 24, 9, 0, 0, false),
    ]);
    expect(set.rrules.map((rrule) => rrule.toString())).toEqual([
      'RRULE:FREQ=DAILY;UNTIL=20000131T140000;BYMONTH=1;BYDAY=MO',
    ]);
    expect(set.exrules).toEqualPlain([]);
    expect([...set]).toEqualPlain(dates);
  });

  describe('folds and gaps', () => {
    it('daily for 10 occurrences across ST => DST', () => {
      const rrule = new RRule(Frequency.Daily).setCount(10);

      const set = new RRuleSet(
        new DtStart(DateTime.local(2025, 3, 8, 2, 0, 0), 'US/Pacific'),
      ).addRRule(rrule);

      expect(set.toString()).toBe(
        'DTSTART;TZID=US/Pacific:20250308T020000\nRRULE:FREQ=DAILY;COUNT=10',
      );

      const all = set.all();
      expect(all).toEqualPlain([
        DateTime.create(2025, 3, 8, 2, 0, 0, false),
        DateTime.create(2025, 3, 9, 3, 0, 0, false),
        DateTime.create(2025, 3, 10, 2, 0, 0, false),
        DateTime.create(2025, 3, 11, 2, 0, 0, false),
        DateTime.create(2025, 3, 12, 2, 0, 0, false),
        DateTime.create(2025, 3, 13, 2, 0, 0, false),
        DateTime.create(2025, 3, 14, 2, 0, 0, false),
        DateTime.create(2025, 3, 15, 2, 0, 0, false),
        DateTime.create(2025, 3, 16, 2, 0, 0, false),
        DateTime.create(2025, 3, 17, 2, 0, 0, false),
      ]);

      const between = set.between(
        DateTime.local(2025, 3, 9, 2, 0, 0),
        DateTime.local(2025, 3, 11, 2, 0, 0),
        true,
      );
      expect(between).toEqualPlain([
        DateTime.create(2025, 3, 9, 3, 0, 0, false),
        DateTime.create(2025, 3, 10, 2, 0, 0, false),
        DateTime.create(2025, 3, 11, 2, 0, 0, false),
      ]);
    });

    it('daily for 10 occurrences across DST => ST', () => {
      const rrule = new RRule(Frequency.Daily).setCount(10);

      const set = new RRuleSet(
        new DtStart(DateTime.local(2025, 11, 1, 1, 0, 0), 'US/Pacific'),
      ).addRRule(rrule);

      expect(set.toString()).toBe(
        'DTSTART;TZID=US/Pacific:20251101T010000\nRRULE:FREQ=DAILY;COUNT=10',
      );

      const all = set.all();
      expect(all).toEqualPlain([
        DateTime.create(2025, 11, 1, 1, 0, 0, false),
        DateTime.create(2025, 11, 2, 1, 0, 0, false),
        DateTime.create(2025, 11, 3, 1, 0, 0, false),
        DateTime.create(2025, 11, 4, 1, 0, 0, false),
        DateTime.create(2025, 11, 5, 1, 0, 0, false),
        DateTime.create(2025, 11, 6, 1, 0, 0, false),
        DateTime.create(2025, 11, 7, 1, 0, 0, false),
        DateTime.create(2025, 11, 8, 1, 0, 0, false),
        DateTime.create(2025, 11, 9, 1, 0, 0, false),
        DateTime.create(2025, 11, 10, 1, 0, 0, false),
      ]);

      const between = set.between(
        DateTime.local(2025, 11, 2, 1, 0, 0),
        DateTime.local(2025, 11, 4, 1, 0, 0),
        true,
      );
      expect(between).toEqualPlain([
        DateTime.create(2025, 11, 2, 1, 0, 0, false),
        DateTime.create(2025, 11, 3, 1, 0, 0, false),
        DateTime.create(2025, 11, 4, 1, 0, 0, false),
      ]);
    });
  });
});
