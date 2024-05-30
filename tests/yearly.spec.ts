import { RRule, RRuleSet, Frequency, Month, Weekday, DateTime } from '../src';

test('Yearly in June and July for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setCount(10)
    .setByMonth([Month.June, Month.July]);
  const set = new RRuleSet(
    DateTime.create(1997, 6, 10, 9, 0, 0, false),
    'US/Eastern',
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970610T090000\nRRULE:FREQ=YEARLY;COUNT=10;BYMONTH=6,7;BYMONTHDAY=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    DateTime.create(1997, 6, 10, 9, 0, 0, false),
    DateTime.create(1997, 7, 10, 9, 0, 0, false),
    DateTime.create(1998, 6, 10, 9, 0, 0, false),
    DateTime.create(1998, 7, 10, 9, 0, 0, false),
    DateTime.create(1999, 6, 10, 9, 0, 0, false),
    DateTime.create(1999, 7, 10, 9, 0, 0, false),
    DateTime.create(2000, 6, 10, 9, 0, 0, false),
    DateTime.create(2000, 7, 10, 9, 0, 0, false),
    DateTime.create(2001, 6, 10, 9, 0, 0, false),
    DateTime.create(2001, 7, 10, 9, 0, 0, false),
  ]);
  expect([...set]).toEqual(dates);
});

test('Every other year on January, February, and March for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setInterval(2)
    .setCount(10)
    .setByMonth([Month.January, Month.February, Month.March]);
  const set = new RRuleSet(
    DateTime.create(1997, 3, 10, 9, 0, 0, false),
    'US/Eastern',
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970310T090000\nRRULE:FREQ=YEARLY;COUNT=10;INTERVAL=2;BYMONTH=1,2,3;BYMONTHDAY=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    DateTime.create(1997, 3, 10, 9, 0, 0, false),
    DateTime.create(1999, 1, 10, 9, 0, 0, false),
    DateTime.create(1999, 2, 10, 9, 0, 0, false),
    DateTime.create(1999, 3, 10, 9, 0, 0, false),
    DateTime.create(2001, 1, 10, 9, 0, 0, false),
    DateTime.create(2001, 2, 10, 9, 0, 0, false),
    DateTime.create(2001, 3, 10, 9, 0, 0, false),
    DateTime.create(2003, 1, 10, 9, 0, 0, false),
    DateTime.create(2003, 2, 10, 9, 0, 0, false),
    DateTime.create(2003, 3, 10, 9, 0, 0, false),
  ]);
  expect([...set]).toEqual(dates);
});

test('Every 3rd year on the 1st, 100th and 200th day for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setCount(10)
    .setInterval(3)
    .setByYearday([1, 100, 200]);
  const set = new RRuleSet(
    DateTime.create(1997, 1, 1, 9, 0, 0, false),
    'US/Eastern',
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970101T090000\nRRULE:FREQ=YEARLY;COUNT=10;INTERVAL=3;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYYEARDAY=1,100,200',
  );
  expect(dates).toEqual([
    DateTime.create(1997, 1, 1, 9, 0, 0, false),
    DateTime.create(1997, 4, 10, 9, 0, 0, false),
    DateTime.create(1997, 7, 19, 9, 0, 0, false),
    DateTime.create(2000, 1, 1, 9, 0, 0, false),
    DateTime.create(2000, 4, 9, 9, 0, 0, false),
    DateTime.create(2000, 7, 18, 9, 0, 0, false),
    DateTime.create(2003, 1, 1, 9, 0, 0, false),
    DateTime.create(2003, 4, 10, 9, 0, 0, false),
    DateTime.create(2003, 7, 19, 9, 0, 0, false),
    DateTime.create(2006, 1, 1, 9, 0, 0, false),
  ]);
  expect([...set]).toEqual(dates);
});

test('Every 20th Monday of the year, limit 3', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setByWeekday([Weekday.Monday])
    .setBySetpos([20]);
  const set = new RRuleSet(
    DateTime.create(1997, 5, 12, 9, 0, 0, false),
    'US/Eastern',
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(3);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970512T090000\nRRULE:FREQ=YEARLY;BYSETPOS=20;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO',
  );
  expect(dates).toEqual([
    DateTime.create(1997, 5, 19, 9, 0, 0, false),
    DateTime.create(1998, 5, 18, 9, 0, 0, false),
    DateTime.create(1999, 5, 17, 9, 0, 0, false),
  ]);
});

test('Monday of week number 20 (where the default start of the week is Monday), limit 3', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setWeekstart(Weekday.Monday)
    .setByWeekday([Weekday.Monday])
    .setByWeekno([20]);
  const set = new RRuleSet(
    DateTime.create(1997, 5, 12, 9, 0, 0, false),
    'US/Eastern',
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(3);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970512T090000\nRRULE:FREQ=YEARLY;BYWEEKNO=20;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO',
  );
  expect(dates).toEqual([
    DateTime.create(1997, 5, 12, 9, 0, 0, false),
    DateTime.create(1998, 5, 11, 9, 0, 0, false),
    DateTime.create(1999, 5, 17, 9, 0, 0, false),
  ]);
});

test('Every Thursday in March, limit 11', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setByMonth([Month.March])
    .setByWeekday([Weekday.Thursday]);
  const set = new RRuleSet(
    DateTime.create(1997, 3, 13, 9, 0, 0, false),
    'US/Eastern',
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(11);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970313T090000\nRRULE:FREQ=YEARLY;BYMONTH=3;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TH',
  );
  expect(dates).toEqual([
    DateTime.create(1997, 3, 13, 9, 0, 0, false),
    DateTime.create(1997, 3, 20, 9, 0, 0, false),
    DateTime.create(1997, 3, 27, 9, 0, 0, false),
    DateTime.create(1998, 3, 5, 9, 0, 0, false),
    DateTime.create(1998, 3, 12, 9, 0, 0, false),
    DateTime.create(1998, 3, 19, 9, 0, 0, false),
    DateTime.create(1998, 3, 26, 9, 0, 0, false),
    DateTime.create(1999, 3, 4, 9, 0, 0, false),
    DateTime.create(1999, 3, 11, 9, 0, 0, false),
    DateTime.create(1999, 3, 18, 9, 0, 0, false),
    DateTime.create(1999, 3, 25, 9, 0, 0, false),
  ]);
});

test('Every Friday the 13th, limit 5', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setByWeekday([Weekday.Friday])
    .setByMonthday([13]);
  const set = new RRuleSet(
    DateTime.create(1997, 9, 2, 9, 0, 0, false),
    'US/Eastern',
  )
    .addExdate(DateTime.create(1998, 3, 13, 9, 0, 0, false))
    .addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(5);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\n' +
      'RRULE:FREQ=YEARLY;BYMONTHDAY=13;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=FR\n' +
      'EXDATE:19980313T090000',
  );
  expect(dates).toEqual([
    DateTime.create(1998, 2, 13, 9, 0, 0, false),
    DateTime.create(1998, 11, 13, 9, 0, 0, false),
    DateTime.create(1999, 8, 13, 9, 0, 0, false),
    DateTime.create(2000, 10, 13, 9, 0, 0, false),
    DateTime.create(2001, 4, 13, 9, 0, 0, false),
  ]);
});

test('Every four years, the first Tuesday after a Monday in November, forever (U.S. Presidential Election day)', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setInterval(4)
    .setByMonth([Month.November])
    .setByWeekday([Weekday.Tuesday])
    .setByMonthday([2, 3, 4, 5, 6, 7, 8]);
  const set = new RRuleSet(
    DateTime.create(1996, 11, 5, 9, 0, 0, false),
    'US/Eastern',
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(3);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19961105T090000\nRRULE:FREQ=YEARLY;INTERVAL=4;BYMONTH=11;BYMONTHDAY=2,3,4,5,6,7,8;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TU',
  );
  expect(dates).toEqual([
    DateTime.create(1996, 11, 5, 9, 0, 0, false),
    DateTime.create(2000, 11, 7, 9, 0, 0, false),
    DateTime.create(2004, 11, 2, 9, 0, 0, false),
  ]);
});
