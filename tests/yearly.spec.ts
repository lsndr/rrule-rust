import { RRule, RRuleSet, Frequency, Month, Weekday } from '../src';

test('Yearly in June and July for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setCount(10)
    .setByMonth([Month.June, Month.July]);
  const set = new RRuleSet(199706100900000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970610T090000\nRRULE:FREQ=YEARLY;COUNT=10;BYMONTH=6,7;BYMONTHDAY=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    199706100900000, 199707100900000, 199806100900000, 199807100900000,
    199906100900000, 199907100900000, 200006100900000, 200007100900000,
    200106100900000, 200107100900000,
  ]);
});

test('Every other year on January, February, and March for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setInterval(2)
    .setCount(10)
    .setByMonth([Month.January, Month.February, Month.March]);
  const set = new RRuleSet(199703100900000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970310T090000\nRRULE:FREQ=YEARLY;COUNT=10;INTERVAL=2;BYMONTH=1,2,3;BYMONTHDAY=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    199703100900000, 199901100900000, 199902100900000, 199903100900000,
    200101100900000, 200102100900000, 200103100900000, 200301100900000,
    200302100900000, 200303100900000,
  ]);
});

test('Every 3rd year on the 1st, 100th and 200th day for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setCount(10)
    .setInterval(3)
    .setByYearday([1, 100, 200]);
  const set = new RRuleSet(199701010900000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970101T090000\nRRULE:FREQ=YEARLY;COUNT=10;INTERVAL=3;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYYEARDAY=1,100,200',
  );
  expect(dates).toEqual([
    199701010900000, 199704100900000, 199707190900000, 200001010900000,
    200004090900000, 200007180900000, 200301010900000, 200304100900000,
    200307190900000, 200601010900000,
  ]);
});

test('Every 20th Monday of the year, limit 3', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setByWeekday([Weekday.Monday])
    .setBySetpos([20]);
  const set = new RRuleSet(199705120900000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(3);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970512T090000\nRRULE:FREQ=YEARLY;BYSETPOS=20;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO',
  );
  expect(dates).toEqual([199705190900000, 199805180900000, 199905170900000]);
});

test('Monday of week number 20 (where the default start of the week is Monday), limit 3', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setWeekstart(Weekday.Monday)
    .setByWeekday([Weekday.Monday])
    .setByWeekno([20]);
  const set = new RRuleSet(199705120900000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(3);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970512T090000\nRRULE:FREQ=YEARLY;BYWEEKNO=20;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO',
  );
  expect(dates).toEqual([199705120900000, 199805110900000, 199905170900000]);
});

test('Every Thursday in March, limit 11', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setByMonth([Month.March])
    .setByWeekday([Weekday.Thursday]);
  const set = new RRuleSet(199703130900000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(11);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970313T090000\nRRULE:FREQ=YEARLY;BYMONTH=3;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TH',
  );
  expect(dates).toEqual([
    199703130900000, 199703200900000, 199703270900000, 199803050900000,
    199803120900000, 199803190900000, 199803260900000, 199903040900000,
    199903110900000, 199903180900000, 199903250900000,
  ]);
});

test('Every Friday the 13th, limit 5', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setByWeekday([Weekday.Friday])
    .setByMonthday([13]);
  const set = new RRuleSet(199709020900000, 'US/Eastern')
    .addExdate(199803130900000)
    .addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(5);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\n' +
      'RRULE:FREQ=YEARLY;BYMONTHDAY=13;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=FR\n' +
      // TODO: it should not contain Z in the end. Create a bug report.
      'EXDATE;VALUE=DATE-TIME:19980313T090000Z',
  );
  expect(dates).toEqual([
    199802130900000, 199811130900000, 199908130900000, 200010130900000,
    200104130900000,
  ]);
});

test('Every four years, the first Tuesday after a Monday in November, forever (U.S. Presidential Election day)', () => {
  const rrule = new RRule(Frequency.Yearly)
    .setInterval(4)
    .setByMonth([Month.November])
    .setByWeekday([Weekday.Tuesday])
    .setByMonthday([2, 3, 4, 5, 6, 7, 8]);
  const set = new RRuleSet(199611050900000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(3);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19961105T090000\nRRULE:FREQ=YEARLY;INTERVAL=4;BYMONTH=11;BYMONTHDAY=2,3,4,5,6,7,8;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TU',
  );
  expect(dates).toEqual([199611050900000, 200011070900000, 200411020900000]);
});
