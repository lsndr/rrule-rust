import {
  RRule,
  RRuleSet,
  Frequency,
  Weekday,
  DateTime,
  DtStart,
} from '../../src';

describe('Weekly', () => {
  it('weekly for 10 occurrences', () => {
    const rrule = new RRule(Frequency.Weekly).setCount(10);
    const set = new RRuleSet(
      new DtStart({
        datetime: DateTime.create(1997, 9, 2, 9, 0, 0, false),
        tzid: 'US/Eastern',
      }),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;COUNT=10',
    );
    expect(dates).toEqualPlain([
      DateTime.create(1997, 9, 2, 9, 0, 0, false),
      DateTime.create(1997, 9, 9, 9, 0, 0, false),
      DateTime.create(1997, 9, 16, 9, 0, 0, false),
      DateTime.create(1997, 9, 23, 9, 0, 0, false),
      DateTime.create(1997, 9, 30, 9, 0, 0, false),
      DateTime.create(1997, 10, 7, 9, 0, 0, false),
      DateTime.create(1997, 10, 14, 9, 0, 0, false),
      DateTime.create(1997, 10, 21, 9, 0, 0, false),
      DateTime.create(1997, 10, 28, 9, 0, 0, false),
      DateTime.create(1997, 11, 4, 9, 0, 0, false),
    ]);
    expect([...set]).toEqualPlain(dates);
  });

  it('weekly until December 24, 1997', () => {
    const rrule = new RRule(Frequency.Weekly).setUntil(
      DateTime.create(1997, 12, 24, 0, 0, 0, false),
    );
    const set = new RRuleSet(
      new DtStart({
        datetime: DateTime.create(1997, 9, 2, 9, 0, 0, false),
        tzid: 'US/Eastern',
      }),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;UNTIL=19971224T000000',
    );
    expect(dates).toEqualPlain([
      DateTime.create(1997, 9, 2, 9, 0, 0, false),
      DateTime.create(1997, 9, 9, 9, 0, 0, false),
      DateTime.create(1997, 9, 16, 9, 0, 0, false),
      DateTime.create(1997, 9, 23, 9, 0, 0, false),
      DateTime.create(1997, 9, 30, 9, 0, 0, false),
      DateTime.create(1997, 10, 7, 9, 0, 0, false),
      DateTime.create(1997, 10, 14, 9, 0, 0, false),
      DateTime.create(1997, 10, 21, 9, 0, 0, false),
      DateTime.create(1997, 10, 28, 9, 0, 0, false),
      DateTime.create(1997, 11, 4, 9, 0, 0, false),
      DateTime.create(1997, 11, 11, 9, 0, 0, false),
      DateTime.create(1997, 11, 18, 9, 0, 0, false),
      DateTime.create(1997, 11, 25, 9, 0, 0, false),
      DateTime.create(1997, 12, 2, 9, 0, 0, false),
      DateTime.create(1997, 12, 9, 9, 0, 0, false),
      DateTime.create(1997, 12, 16, 9, 0, 0, false),
      DateTime.create(1997, 12, 23, 9, 0, 0, false),
    ]);
    expect([...set]).toEqualPlain(dates);
  });

  it('every other week - limit 10', () => {
    const rrule = new RRule(Frequency.Weekly)
      .setInterval(2)
      .setWeekstart(Weekday.Sunday);
    const set = new RRuleSet(
      new DtStart({
        datetime: DateTime.create(1997, 9, 2, 9, 0, 0, false),
        tzid: 'US/Eastern',
      }),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all(10);

    expect(asString).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;WKST=SU',
    );
    expect(dates).toEqualPlain([
      DateTime.create(1997, 9, 2, 9, 0, 0, false),
      DateTime.create(1997, 9, 16, 9, 0, 0, false),
      DateTime.create(1997, 9, 30, 9, 0, 0, false),
      DateTime.create(1997, 10, 14, 9, 0, 0, false),
      DateTime.create(1997, 10, 28, 9, 0, 0, false),
      DateTime.create(1997, 11, 11, 9, 0, 0, false),
      DateTime.create(1997, 11, 25, 9, 0, 0, false),
      DateTime.create(1997, 12, 9, 9, 0, 0, false),
      DateTime.create(1997, 12, 23, 9, 0, 0, false),
      DateTime.create(1998, 1, 6, 9, 0, 0, false),
    ]);
  });

  it('every other week on Monday, Wednesday and Friday until December 24, 1997, but starting on Tuesday, September 2, 1997', () => {
    const rrule = new RRule(Frequency.Weekly)
      .setInterval(2)
      .setUntil(DateTime.create(1997, 12, 24, 0, 0, 0, false))
      .setWeekstart(Weekday.Sunday)
      .setByWeekday([Weekday.Monday, Weekday.Wednesday, Weekday.Friday]);
    const set = new RRuleSet(
      new DtStart({
        datetime: DateTime.create(1997, 9, 2, 9, 0, 0, false),
        tzid: 'US/Eastern',
      }),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000;BYDAY=MO,WE,FR;WKST=SU',
    );
    expect(dates).toEqualPlain([
      // TODO: rrule crate does not include dtstart date (873205200000), create a bug report
      DateTime.create(1997, 9, 3, 9, 0, 0, false),
      DateTime.create(1997, 9, 5, 9, 0, 0, false),
      DateTime.create(1997, 9, 15, 9, 0, 0, false),
      DateTime.create(1997, 9, 17, 9, 0, 0, false),
      DateTime.create(1997, 9, 19, 9, 0, 0, false),
      DateTime.create(1997, 9, 29, 9, 0, 0, false),
      DateTime.create(1997, 10, 1, 9, 0, 0, false),
      DateTime.create(1997, 10, 3, 9, 0, 0, false),
      DateTime.create(1997, 10, 13, 9, 0, 0, false),
      DateTime.create(1997, 10, 15, 9, 0, 0, false),
      DateTime.create(1997, 10, 17, 9, 0, 0, false),
      DateTime.create(1997, 10, 27, 9, 0, 0, false),
      DateTime.create(1997, 10, 29, 9, 0, 0, false),
      DateTime.create(1997, 10, 31, 9, 0, 0, false),
      DateTime.create(1997, 11, 10, 9, 0, 0, false),
      DateTime.create(1997, 11, 12, 9, 0, 0, false),
      DateTime.create(1997, 11, 14, 9, 0, 0, false),
      DateTime.create(1997, 11, 24, 9, 0, 0, false),
      DateTime.create(1997, 11, 26, 9, 0, 0, false),
      DateTime.create(1997, 11, 28, 9, 0, 0, false),
      DateTime.create(1997, 12, 8, 9, 0, 0, false),
      DateTime.create(1997, 12, 10, 9, 0, 0, false),
      DateTime.create(1997, 12, 12, 9, 0, 0, false),
      DateTime.create(1997, 12, 22, 9, 0, 0, false),
    ]);
    expect([...set]).toEqualPlain(dates);
  });

  it('every other week for 4 occurrences when week starts on Monday', () => {
    const rrule = new RRule(Frequency.Weekly)
      .setInterval(2)
      .setCount(4)
      .setByWeekday([Weekday.Tuesday, Weekday.Sunday])
      .setWeekstart(Weekday.Monday);
    const set = new RRuleSet(
      new DtStart({
        datetime: DateTime.create(1997, 8, 5, 9, 0, 0, false),
        tzid: 'America/New_York',
      }),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970805T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=TU,SU;WKST=MO',
    );
    expect(dates).toEqualPlain([
      DateTime.create(1997, 8, 5, 9, 0, 0, false),
      DateTime.create(1997, 8, 10, 9, 0, 0, false),
      DateTime.create(1997, 8, 19, 9, 0, 0, false),
      DateTime.create(1997, 8, 24, 9, 0, 0, false),
    ]);
    expect([...set]).toEqualPlain(dates);
  });

  it('every other week for 4 occurrences when week starts on Sunday', () => {
    const rrule = new RRule(Frequency.Weekly)
      .setInterval(2)
      .setCount(4)
      .setByWeekday([Weekday.Tuesday, Weekday.Sunday])
      .setWeekstart(Weekday.Sunday);
    const set = new RRuleSet(
      new DtStart({
        datetime: DateTime.create(1997, 8, 5, 9, 0, 0, false),
        tzid: 'America/New_York',
      }),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970805T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=TU,SU;WKST=SU',
    );
    expect(dates).toEqualPlain([
      DateTime.create(1997, 8, 5, 9, 0, 0, false),
      DateTime.create(1997, 8, 17, 9, 0, 0, false),
      DateTime.create(1997, 8, 19, 9, 0, 0, false),
      DateTime.create(1997, 8, 31, 9, 0, 0, false),
    ]);
    expect([...set]).toEqualPlain(dates);
  });
});
