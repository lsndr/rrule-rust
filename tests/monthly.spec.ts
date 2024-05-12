import { RRule, RRuleSet, Frequency, Weekday, DateTime } from '../src';

test('Monthly on the 1st Friday for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setCount(10)
    .setByWeekday([Weekday.Friday])
    .setBySetpos([1]);
  const set = new RRuleSet(
    DateTime.fromDate(1997, 9, 2, 9, 0, 0, false),
    'US/Eastern',
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=10;BYSETPOS=1;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=FR',
  );
  expect(dates).toEqual([
    DateTime.fromDate(1997, 9, 5, 9, 0, 0, false),
    DateTime.fromDate(1997, 10, 3, 9, 0, 0, false),
    DateTime.fromDate(1997, 11, 7, 9, 0, 0, false),
    DateTime.fromDate(1997, 12, 5, 9, 0, 0, false),
    DateTime.fromDate(1998, 1, 2, 9, 0, 0, false),
    DateTime.fromDate(1998, 2, 6, 9, 0, 0, false),
    DateTime.fromDate(1998, 3, 6, 9, 0, 0, false),
    DateTime.fromDate(1998, 4, 3, 9, 0, 0, false),
    DateTime.fromDate(1998, 5, 1, 9, 0, 0, false),
    DateTime.fromDate(1998, 6, 5, 9, 0, 0, false),
  ]);
  expect([...set]).toEqual(dates);
});

test('Monthly on the 1st Friday until December 24, 1997', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setUntil(DateTime.fromDate(1997, 12, 24, 0, 0, 0, false))
    .setByWeekday([Weekday.Friday])
    .setBySetpos([1]);
  const set = new RRuleSet(
    DateTime.fromDate(1997, 9, 2, 9, 0, 0, false),
    'US/Eastern',
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;UNTIL=19971224T050000Z;BYSETPOS=1;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=FR',
  );
  expect(dates).toEqual([
    DateTime.fromDate(1997, 9, 5, 9, 0, 0, false),
    DateTime.fromDate(1997, 10, 3, 9, 0, 0, false),
    DateTime.fromDate(1997, 11, 7, 9, 0, 0, false),
    DateTime.fromDate(1997, 12, 5, 9, 0, 0, false),
  ]);
  expect([...set]).toEqual(dates);
});

test('Every other month on the 1st and last Sunday of the month for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setInterval(2)
    .setCount(10)
    .setByWeekday([Weekday.Sunday, Weekday.Sunday])
    .setBySetpos([1, -1]);
  const set = new RRuleSet(
    DateTime.fromDate(1997, 9, 2, 9, 0, 0, false),
    'US/Eastern',
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=10;INTERVAL=2;BYSETPOS=-1,1;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=SU',
  );
  expect(dates).toEqual([
    DateTime.fromDate(1997, 9, 7, 9, 0, 0, false),
    DateTime.fromDate(1997, 9, 28, 9, 0, 0, false),
    DateTime.fromDate(1997, 11, 2, 9, 0, 0, false),
    DateTime.fromDate(1997, 11, 30, 9, 0, 0, false),
    DateTime.fromDate(1998, 1, 4, 9, 0, 0, false),
    DateTime.fromDate(1998, 1, 25, 9, 0, 0, false),
    DateTime.fromDate(1998, 3, 1, 9, 0, 0, false),
    DateTime.fromDate(1998, 3, 29, 9, 0, 0, false),
    DateTime.fromDate(1998, 5, 3, 9, 0, 0, false),
    DateTime.fromDate(1998, 5, 31, 9, 0, 0, false),
  ]);
  expect([...set]).toEqual(dates);
});

test('Monthly on the second to last Monday of the month for 6 months', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setCount(6)
    .setByWeekday([Weekday.Monday])
    .setBySetpos([-2]);
  const set = new RRuleSet(
    DateTime.fromDate(1997, 9, 2, 9, 0, 0, false),
    'US/Eastern',
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=6;BYSETPOS=-2;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO',
  );
  expect(dates).toEqual([
    DateTime.fromDate(1997, 9, 22, 9, 0, 0, false),
    DateTime.fromDate(1997, 10, 20, 9, 0, 0, false),
    DateTime.fromDate(1997, 11, 17, 9, 0, 0, false),
    DateTime.fromDate(1997, 12, 22, 9, 0, 0, false),
    DateTime.fromDate(1998, 1, 19, 9, 0, 0, false),
    DateTime.fromDate(1998, 2, 16, 9, 0, 0, false),
  ]);
  expect([...set]).toEqual(dates);
});

test('Monthly on the third to the last day of the month, limit 6', () => {
  const rrule = new RRule(Frequency.Monthly).setByMonthday([-3]);
  const set = new RRuleSet(
    DateTime.fromDate(1997, 9, 2, 9, 0, 0, false),
    'US/Eastern',
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(6);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    DateTime.fromDate(1997, 9, 28, 9, 0, 0, false),
    DateTime.fromDate(1997, 10, 29, 9, 0, 0, false),
    DateTime.fromDate(1997, 11, 28, 9, 0, 0, false),
    DateTime.fromDate(1997, 12, 29, 9, 0, 0, false),
    DateTime.fromDate(1998, 1, 29, 9, 0, 0, false),
    DateTime.fromDate(1998, 2, 26, 9, 0, 0, false),
  ]);
});

test('Monthly on the 2nd and 15th of the month for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setCount(10)
    .setByMonthday([2, 15]);
  const set = new RRuleSet(
    DateTime.fromDate(1997, 9, 2, 9, 0, 0, false),
    'US/Eastern',
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=10;BYMONTHDAY=2,15;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    DateTime.fromDate(1997, 9, 2, 9, 0, 0, false),
    DateTime.fromDate(1997, 9, 15, 9, 0, 0, false),
    DateTime.fromDate(1997, 10, 2, 9, 0, 0, false),
    DateTime.fromDate(1997, 10, 15, 9, 0, 0, false),
    DateTime.fromDate(1997, 11, 2, 9, 0, 0, false),
    DateTime.fromDate(1997, 11, 15, 9, 0, 0, false),
    DateTime.fromDate(1997, 12, 2, 9, 0, 0, false),
    DateTime.fromDate(1997, 12, 15, 9, 0, 0, false),
    DateTime.fromDate(1998, 1, 2, 9, 0, 0, false),
    DateTime.fromDate(1998, 1, 15, 9, 0, 0, false),
  ]);
  expect([...set]).toEqual(dates);
});

test('Monthly on the first and last day of the month for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setCount(10)
    .setByMonthday([1, -1]);
  const set = new RRuleSet(
    DateTime.fromDate(1997, 9, 2, 9, 0, 0, false),
    'US/Eastern',
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=10;BYMONTHDAY=1;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    DateTime.fromDate(1997, 9, 30, 9, 0, 0, false),
    DateTime.fromDate(1997, 10, 1, 9, 0, 0, false),
    DateTime.fromDate(1997, 10, 31, 9, 0, 0, false),
    DateTime.fromDate(1997, 11, 1, 9, 0, 0, false),
    DateTime.fromDate(1997, 11, 30, 9, 0, 0, false),
    DateTime.fromDate(1997, 12, 1, 9, 0, 0, false),
    DateTime.fromDate(1997, 12, 31, 9, 0, 0, false),
    DateTime.fromDate(1998, 1, 1, 9, 0, 0, false),
    DateTime.fromDate(1998, 1, 31, 9, 0, 0, false),
    DateTime.fromDate(1998, 2, 1, 9, 0, 0, false),
  ]);
  expect([...set]).toEqual(dates);
});

test('Every 18 months on the 10th thru 15th of the month for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setCount(10)
    .setInterval(18)
    .setByMonthday([10, 11, 12, 13, 14, 15]);
  const set = new RRuleSet(
    DateTime.fromDate(1997, 9, 2, 9, 0, 0, false),
    'US/Eastern',
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=10;INTERVAL=18;BYMONTHDAY=10,11,12,13,14,15;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    DateTime.fromDate(1997, 9, 10, 9, 0, 0, false),
    DateTime.fromDate(1997, 9, 11, 9, 0, 0, false),
    DateTime.fromDate(1997, 9, 12, 9, 0, 0, false),
    DateTime.fromDate(1997, 9, 13, 9, 0, 0, false),
    DateTime.fromDate(1997, 9, 14, 9, 0, 0, false),
    DateTime.fromDate(1997, 9, 15, 9, 0, 0, false),
    DateTime.fromDate(1999, 3, 10, 9, 0, 0, false),
    DateTime.fromDate(1999, 3, 11, 9, 0, 0, false),
    DateTime.fromDate(1999, 3, 12, 9, 0, 0, false),
    DateTime.fromDate(1999, 3, 13, 9, 0, 0, false),
  ]);
  expect([...set]).toEqual(dates);
});

test('Monthly 5 times with two rdates and one exdate', () => {
  const rrule = new RRule(Frequency.Monthly).setCount(5);
  const set = new RRuleSet(
    DateTime.fromDate(2012, 2, 1, 2, 30, 0, false),
    'UTC',
  )
    .addRrule(rrule)
    .addRdate(DateTime.fromDate(2012, 7, 1, 2, 30, 0, false))
    .addRdate(DateTime.fromDate(2012, 7, 2, 2, 30, 0, false))
    .addExdate(DateTime.fromDate(2012, 6, 1, 2, 30, 0, false));

  const dates = set.all();

  expect(set.rdates).toEqual([
    DateTime.fromDate(2012, 7, 1, 2, 30, 0, false),
    DateTime.fromDate(2012, 7, 2, 2, 30, 0, false),
  ]);
  expect(set.exdates).toEqual([DateTime.fromDate(2012, 6, 1, 2, 30, 0, false)]);
  expect(dates).toEqual([
    DateTime.fromDate(2012, 2, 1, 2, 30, 0, true),
    DateTime.fromDate(2012, 3, 1, 2, 30, 0, true),
    DateTime.fromDate(2012, 4, 1, 2, 30, 0, true),
    DateTime.fromDate(2012, 5, 1, 2, 30, 0, true),
    DateTime.fromDate(2012, 7, 1, 2, 30, 0, true),
    DateTime.fromDate(2012, 7, 2, 2, 30, 0, true),
  ]);
  expect([...set]).toEqual(dates);
});

test('Every Tuesday, every other month, limit 18', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setInterval(2)
    .setByWeekday([Weekday.Tuesday]);
  const set = new RRuleSet(
    DateTime.fromDate(1997, 9, 2, 9, 0, 0, false),
    'US/Eastern',
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(18);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;INTERVAL=2;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TU',
  );
  expect(dates).toEqual([
    DateTime.fromDate(1997, 9, 2, 9, 0, 0, false),
    DateTime.fromDate(1997, 9, 9, 9, 0, 0, false),
    DateTime.fromDate(1997, 9, 16, 9, 0, 0, false),
    DateTime.fromDate(1997, 9, 23, 9, 0, 0, false),
    DateTime.fromDate(1997, 9, 30, 9, 0, 0, false),
    DateTime.fromDate(1997, 11, 4, 9, 0, 0, false),
    DateTime.fromDate(1997, 11, 11, 9, 0, 0, false),
    DateTime.fromDate(1997, 11, 18, 9, 0, 0, false),
    DateTime.fromDate(1997, 11, 25, 9, 0, 0, false),
    DateTime.fromDate(1998, 1, 6, 9, 0, 0, false),
    DateTime.fromDate(1998, 1, 13, 9, 0, 0, false),
    DateTime.fromDate(1998, 1, 20, 9, 0, 0, false),
    DateTime.fromDate(1998, 1, 27, 9, 0, 0, false),
    DateTime.fromDate(1998, 3, 3, 9, 0, 0, false),
    DateTime.fromDate(1998, 3, 10, 9, 0, 0, false),
    DateTime.fromDate(1998, 3, 17, 9, 0, 0, false),
    DateTime.fromDate(1998, 3, 24, 9, 0, 0, false),
    DateTime.fromDate(1998, 3, 31, 9, 0, 0, false),
  ]);
});

test('Monthly on the second to last Monday of the month for 6 months 1', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setByWeekday([{ weekday: Weekday.Monday, n: -2 }])
    .setCount(6);
  const set = new RRuleSet(
    DateTime.fromDate(1997, 9, 22, 9, 0, 0, false),
    'US/Eastern',
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(8);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970922T090000\nRRULE:FREQ=MONTHLY;COUNT=6;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=-2MO',
  );
  expect(dates).toEqual([
    DateTime.fromDate(1997, 9, 22, 9, 0, 0, false),
    DateTime.fromDate(1997, 10, 20, 9, 0, 0, false),
    DateTime.fromDate(1997, 11, 17, 9, 0, 0, false),
    DateTime.fromDate(1997, 12, 22, 9, 0, 0, false),
    DateTime.fromDate(1998, 1, 19, 9, 0, 0, false),
    DateTime.fromDate(1998, 2, 16, 9, 0, 0, false),
  ]);
  expect([...set]).toEqual(dates);
});

test('Errors on invalid by-weekday', () => {
  expect(() =>
    new RRule(Frequency.Monthly).setByWeekday(['invalid' as any]).toString(),
  ).toThrow('Value is non of these types `NWeekday`, `Weekday`');
});
