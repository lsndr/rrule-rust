import { RRule, RRuleSet, Frequency, Month, Weekday } from '../src';

test('Yearly in June and July for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setCount(10)
    .setByMonth([Month.June, Month.July]);
  const set = new RRuleSet(865947600000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970610T090000\nRRULE:FREQ=YEARLY;COUNT=10;BYMONTH=6,7;BYMONTHDAY=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    865947600000, 868539600000, 897483600000, 900075600000, 929019600000,
    931611600000, 960642000000, 963234000000, 992178000000, 994770000000,
  ]);
});

test('Every other year on January, February, and March for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setInterval(2)
    .setCount(10)
    .setByMonth([Month.January, Month.February, Month.March]);
  const set = new RRuleSet(858002400000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970310T090000\nRRULE:FREQ=YEARLY;COUNT=10;INTERVAL=2;BYMONTH=1,2,3;BYMONTHDAY=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    858002400000, 915976800000, 918655200000, 921074400000, 979135200000,
    981813600000, 984232800000, 1042207200000, 1044885600000, 1047304800000,
  ]);
});

test('Every 3rd year on the 1st, 100th and 200th day for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setCount(10)
    .setInterval(3)
    .setByYearday([1, 100, 200]);
  const set = new RRuleSet(852127200000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970101T090000\nRRULE:FREQ=YEARLY;COUNT=10;INTERVAL=3;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYYEARDAY=1,100,200',
  );
  expect(dates).toEqual([
    852127200000, 860677200000, 869317200000, 946735200000, 955285200000,
    963925200000, 1041429600000, 1049979600000, 1058619600000, 1136124000000,
  ]);
});

test('Every 20th Monday of the year, limit 3', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setByWeekday([Weekday.Monday])
    .setBySetpos([20]);
  const set = new RRuleSet(863442000000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(3);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970512T090000\nRRULE:FREQ=YEARLY;BYSETPOS=20;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO',
  );
  expect(dates).toEqual([864046800000, 895496400000, 926946000000]);
});

test('Monday of week number 20 (where the default start of the week is Monday), limit 3', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setWeekstart(Weekday.Monday)
    .setByWeekday([Weekday.Monday])
    .setByWeekno([20]);
  const set = new RRuleSet(863442000000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(3);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970512T090000\nRRULE:FREQ=YEARLY;BYWEEKNO=20;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO',
  );
  expect(dates).toEqual([863442000000, 894891600000, 926946000000]);
});

test('Every Thursday in March, limit 11', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setByMonth([Month.March])
    .setByWeekday([Weekday.Thursday]);
  const set = new RRuleSet(858261600000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(11);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970313T090000\nRRULE:FREQ=YEARLY;BYMONTH=3;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TH',
  );
  expect(dates).toEqual([
    858261600000, 858866400000, 859471200000, 889106400000, 889711200000,
    890316000000, 890920800000, 920556000000, 921160800000, 921765600000,
    922370400000,
  ]);
});

test('Every Friday the 13th, limit 5', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setByWeekday([Weekday.Friday])
    .setByMonthday([13]);
  const set = new RRuleSet(873205200000, 'US/Eastern')
    .addExdate(889797600000)
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
    887378400000, 910965600000, 934549200000, 971442000000, 987166800000,
  ]);
});

test('Every four years, the first Tuesday after a Monday in November, forever (U.S. Presidential Election day)', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setInterval(4)
    .setByMonth([Month.November])
    .setByWeekday([Weekday.Tuesday])
    .setByMonthday([2, 3, 4, 5, 6, 7, 8]);
  const set = new RRuleSet(847202400000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(3);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19961105T090000\nRRULE:FREQ=YEARLY;INTERVAL=4;BYMONTH=11;BYMONTHDAY=2,3,4,5,6,7,8;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TU',
  );
  expect(dates).toEqual([847202400000, 973605600000, 1099404000000]);
});
