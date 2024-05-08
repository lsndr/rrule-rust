import { RRule, RRuleSet, Frequency, Month, Weekday } from '../src';

test('Yearly in June and July for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setCount(10)
    .setByMonth([Month.June, Month.July]);
  const set = new RRuleSet(19970610090000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970610T090000\nRRULE:FREQ=YEARLY;COUNT=10;BYMONTH=6,7;BYMONTHDAY=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    19970610090000, 19970710090000, 19980610090000, 19980710090000,
    19990610090000, 19990710090000, 20000610090000, 20000710090000,
    20010610090000, 20010710090000,
  ]);
});

test('Every other year on January, February, and March for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setInterval(2)
    .setCount(10)
    .setByMonth([Month.January, Month.February, Month.March]);
  const set = new RRuleSet(19970310090000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970310T090000\nRRULE:FREQ=YEARLY;COUNT=10;INTERVAL=2;BYMONTH=1,2,3;BYMONTHDAY=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    19970310090000, 19990110090000, 19990210090000, 19990310090000,
    20010110090000, 20010210090000, 20010310090000, 20030110090000,
    20030210090000, 20030310090000,
  ]);
});

test('Every 3rd year on the 1st, 100th and 200th day for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setCount(10)
    .setInterval(3)
    .setByYearday([1, 100, 200]);
  const set = new RRuleSet(19970101090000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970101T090000\nRRULE:FREQ=YEARLY;COUNT=10;INTERVAL=3;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYYEARDAY=1,100,200',
  );
  expect(dates).toEqual([
    19970101090000, 19970410090000, 19970719090000, 20000101090000,
    20000409090000, 20000718090000, 20030101090000, 20030410090000,
    20030719090000, 20060101090000,
  ]);
});

test('Every 20th Monday of the year, limit 3', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setByWeekday([Weekday.Monday])
    .setBySetpos([20]);
  const set = new RRuleSet(19970512090000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(3);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970512T090000\nRRULE:FREQ=YEARLY;BYSETPOS=20;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO',
  );
  expect(dates).toEqual([19970519090000, 19980518090000, 19990517090000]);
});

test('Monday of week number 20 (where the default start of the week is Monday), limit 3', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setWeekstart(Weekday.Monday)
    .setByWeekday([Weekday.Monday])
    .setByWeekno([20]);
  const set = new RRuleSet(19970512090000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(3);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970512T090000\nRRULE:FREQ=YEARLY;BYWEEKNO=20;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO',
  );
  expect(dates).toEqual([19970512090000, 19980511090000, 19990517090000]);
});

test('Every Thursday in March, limit 11', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setByMonth([Month.March])
    .setByWeekday([Weekday.Thursday]);
  const set = new RRuleSet(19970313090000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(11);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970313T090000\nRRULE:FREQ=YEARLY;BYMONTH=3;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TH',
  );
  expect(dates).toEqual([
    19970313090000, 19970320090000, 19970327090000, 19980305090000,
    19980312090000, 19980319090000, 19980326090000, 19990304090000,
    19990311090000, 19990318090000, 19990325090000,
  ]);
});

test('Every Friday the 13th, limit 5', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setByWeekday([Weekday.Friday])
    .setByMonthday([13]);
  const set = new RRuleSet(19970902090000, 'US/Eastern')
    .addExdate(19980313090000)
    .addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(5);

  // TODO: rrule crate doesn't add exdate to string output, create a bug report
  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\n' +
      'RRULE:FREQ=YEARLY;BYMONTHDAY=13;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=FR\n' +
      'EXDATE;VALUE=DATE-TIME:19980313T090000Z',
  );
  expect(dates).toEqual([
    19980213090000, 19981113090000, 19990813090000, 20001013090000,
    20010413090000,
  ]);
});

test('Every four years, the first Tuesday after a Monday in November, forever (U.S. Presidential Election day)', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setInterval(4)
    .setByMonth([Month.November])
    .setByWeekday([Weekday.Tuesday])
    .setByMonthday([2, 3, 4, 5, 6, 7, 8]);
  const set = new RRuleSet(19961105090000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(3);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19961105T090000\nRRULE:FREQ=YEARLY;INTERVAL=4;BYMONTH=11;BYMONTHDAY=2,3,4,5,6,7,8;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TU',
  );
  expect(dates).toEqual([19961105090000, 20001107090000, 20041102090000]);
});
