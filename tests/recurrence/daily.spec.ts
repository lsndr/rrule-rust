import {
  RRule,
  RRuleSet,
  Frequency,
  Month,
  Weekday,
  DateTime,
} from '../../src';

describe('Daily', () => {
  it('daily for 10 occurrences', () => {
    const rrule = new RRule(Frequency.Daily).setCount(10);
    const set = new RRuleSet(
      DateTime.create(1997, 9, 2, 9, 0, 0, false),
      'US/Eastern',
    ).addRrule(rrule);

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;COUNT=10',
    );
    expect(dates).toEqual([
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
    expect([...set]).toEqual(dates);
  });

  it('daily for 10 occurrences between 873550800000 and 873723600000 inclusively', () => {
    const rrule = new RRule(Frequency.Daily).setCount(10);
    const set = new RRuleSet(
      DateTime.create(1997, 9, 2, 9, 0, 0, false),
      'US/Eastern',
    ).addRrule(rrule);

    const dates = set.between(
      DateTime.create(1997, 9, 6, 9, 0, 0, false),
      DateTime.create(1997, 9, 8, 9, 0, 0, false),
      true,
    );
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;COUNT=10',
    );
    expect(dates).toEqual([
      DateTime.create(1997, 9, 6, 9, 0, 0, false),
      DateTime.create(1997, 9, 7, 9, 0, 0, false),
      DateTime.create(1997, 9, 8, 9, 0, 0, false),
    ]);
  });

  it('daily for 10 occurrences between 873550800000 and 873723600000 exclusively', () => {
    const rrule = new RRule(Frequency.Daily).setCount(10);
    const set = new RRuleSet(
      DateTime.create(1997, 9, 2, 9, 0, 0, false),
      'US/Eastern',
    ).addRrule(rrule);

    const dates = set.between(
      DateTime.create(1997, 9, 6, 9, 0, 0, false),
      DateTime.create(1997, 9, 8, 9, 0, 0, false),
      false,
    );
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;COUNT=10',
    );
    expect(dates).toEqual([DateTime.create(1997, 9, 7, 9, 0, 0, false)]);
  });

  it('daily until September 6, 1997', () => {
    const rrule = new RRule(Frequency.Daily).setUntil(
      DateTime.create(1997, 9, 6, 9, 0, 0, false),
    );
    const set = new RRuleSet(
      DateTime.create(1997, 9, 2, 9, 0, 0, false),
      'US/Eastern',
    ).addRrule(rrule);

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;UNTIL=19970906T090000',
    );
    expect(dates).toEqual([
      DateTime.create(1997, 9, 2, 9, 0, 0, false),
      DateTime.create(1997, 9, 3, 9, 0, 0, false),
      DateTime.create(1997, 9, 4, 9, 0, 0, false),
      DateTime.create(1997, 9, 5, 9, 0, 0, false),
      DateTime.create(1997, 9, 6, 9, 0, 0, false),
    ]);
    expect([...set]).toEqual(dates);
  });

  it('every other day', () => {
    const rrule = new RRule(Frequency.Daily).setCount(6).setInterval(2);
    const set = new RRuleSet(
      DateTime.create(1997, 9, 2, 9, 0, 0, false),
      'US/Eastern',
    ).addRrule(rrule);

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;INTERVAL=2;COUNT=6',
    );
    expect(dates).toEqual([
      DateTime.create(1997, 9, 2, 9, 0, 0, false),
      DateTime.create(1997, 9, 4, 9, 0, 0, false),
      DateTime.create(1997, 9, 6, 9, 0, 0, false),
      DateTime.create(1997, 9, 8, 9, 0, 0, false),
      DateTime.create(1997, 9, 10, 9, 0, 0, false),
      DateTime.create(1997, 9, 12, 9, 0, 0, false),
    ]);
    expect([...set]).toEqual(dates);
  });

  it('every 10 days, 5 occurrences', () => {
    const rrule = new RRule(Frequency.Daily).setCount(5).setInterval(10);
    const set = new RRuleSet(
      DateTime.create(1997, 9, 2, 9, 0, 0, false),
      'US/Eastern',
    ).addRrule(rrule);

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;INTERVAL=10;COUNT=5',
    );
    expect(dates).toEqual([
      DateTime.create(1997, 9, 2, 9, 0, 0, false),
      DateTime.create(1997, 9, 12, 9, 0, 0, false),
      DateTime.create(1997, 9, 22, 9, 0, 0, false),
      DateTime.create(1997, 10, 2, 9, 0, 0, false),
      DateTime.create(1997, 10, 12, 9, 0, 0, false),
    ]);
    expect([...set]).toEqual(dates);
  });

  it('every Monday in January, for 3 years', () => {
    const rrule = new RRule(Frequency.Daily)
      .setByMonth([Month.January])
      .setByWeekday([Weekday.Monday])
      .setUntil(DateTime.create(2000, 1, 31, 14, 0, 0, false));
    const set = new RRuleSet(
      DateTime.create(1997, 9, 2, 9, 0, 0, false),
      'US/Eastern',
    ).addRrule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;UNTIL=20000131T140000;BYMONTH=1;BYDAY=MO',
    );
    expect(dates).toEqual([
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
    expect([...set]).toEqual(dates);
  });

  it('every Monday in January, for 3 years except Jan 31 2000', () => {
    const rrule = new RRule(Frequency.Daily)
      .setByMonth([Month.January])
      .setByWeekday([Weekday.Monday])
      .setUntil(DateTime.create(2000, 1, 31, 14, 0, 0, false));

    const set = new RRuleSet(
      DateTime.create(1997, 9, 2, 9, 0, 0, false),
      'Asia/Tbilisi',
    )
      .addRrule(rrule)
      .addExdate(DateTime.create(2000, 1, 31, 9, 0, 0, false));

    const dates = set.all();

    expect(dates).toEqual([
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
    expect(set.exrules).toEqual([]);
    expect([...set]).toEqual(dates);
  });
});
