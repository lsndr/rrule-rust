import { RRule, RRuleSet, Frequency, Weekday, DateTime } from '../src';

test('Weekly for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Weekly).setCount(10);
  const set = new RRuleSet(
    DateTime.create(1997, 9, 2, 9, 0, 0, false),
    'US/Eastern',
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;COUNT=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TU',
  );
  expect(dates).toEqual([
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
  expect([...set]).toEqual(dates);
});

test('Weekly until December 24, 1997', () => {
  const rrule = new RRule(Frequency.Weekly).setUntil(
    DateTime.create(1997, 12, 24, 0, 0, 0, false),
  );
  const set = new RRuleSet(
    DateTime.create(1997, 9, 2, 9, 0, 0, false),
    'US/Eastern',
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;UNTIL=19971224T050000Z;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TU',
  );
  expect(dates).toEqual([
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
  expect([...set]).toEqual(dates);
});

test('Every other week - limit 10', () => {
  const rrule = new RRule(Frequency.Weekly)
    .setInterval(2)
    .setWeekstart(Weekday.Sunday);
  const set = new RRuleSet(
    DateTime.create(1997, 9, 2, 9, 0, 0, false),
    'US/Eastern',
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(10);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;WKST=SU;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TU',
  );
  expect(dates).toEqual([
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

test('Every other week on Monday, Wednesday and Friday until December 24, 1997, but starting on Tuesday, September 2, 1997', () => {
  const rrule = new RRule(Frequency.Weekly)
    .setInterval(2)
    .setUntil(DateTime.create(1997, 12, 24, 0, 0, 0, false))
    .setWeekstart(Weekday.Sunday)
    .setByWeekday([Weekday.Monday, Weekday.Wednesday, Weekday.Friday]);
  const set = new RRuleSet(
    DateTime.create(1997, 9, 2, 9, 0, 0, false),
    'US/Eastern',
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;UNTIL=19971224T050000Z;INTERVAL=2;WKST=SU;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO,WE,FR',
  );
  expect(dates).toEqual([
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
  expect([...set]).toEqual(dates);
});
