import { RRule, RRuleDateTime, RRuleSet, Frequency, Weekday } from '../';
import { takeN } from './utils';

test('Monthly on the 1st Friday for ten occurrences', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setCount(10)
    .setByWeekday([Weekday.Friday])
    .setBySetpos([1]);
  const set = new RRuleSet(
    new RRuleDateTime(873205200000, 'US/Eastern'),
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all().map((d) => d.timestamp);
  const iteratorDates = Array.from(set.occurrences()).map((d) => d.timestamp);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nFREQ=monthly;COUNT=10;BYSETPOS=1;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=FR',
  );
  expect(dates).toEqual([
    873464400000, 875883600000, 878911200000, 881330400000, 883749600000,
    886773600000, 889192800000, 891612000000, 894027600000, 897051600000,
  ]);
  expect(iteratorDates).toEqual(dates);
});

test('Monthly on the 1st Friday until December 24, 1997', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setUntil(new RRuleDateTime(882921600000, 'UTC'))
    .setByWeekday([Weekday.Friday])
    .setBySetpos([1]);
  const set = new RRuleSet(
    new RRuleDateTime(873205200000, 'US/Eastern'),
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all().map((d) => d.timestamp);
  const iteratorDates = Array.from(set.occurrences()).map((d) => d.timestamp);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nFREQ=monthly;UNTIL=19971224T000000Z;BYSETPOS=1;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=FR',
  );
  expect(dates).toEqual([
    873464400000, 875883600000, 878911200000, 881330400000,
  ]);
  expect(iteratorDates).toEqual(dates);
});

test('Every other month on the 1st and last Sunday of the month for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setInterval(2)
    .setCount(10)
    .setByWeekday([Weekday.Sunday, Weekday.Sunday])
    .setBySetpos([1, -1]);
  const set = new RRuleSet(
    new RRuleDateTime(873205200000, 'US/Eastern'),
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all().map((d) => d.timestamp);
  const iteratorDates = Array.from(set.occurrences()).map((d) => d.timestamp);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nFREQ=monthly;COUNT=10;INTERVAL=2;BYSETPOS=-1,1;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=SU',
  );
  expect(dates).toEqual([
    873637200000, 875451600000, 878479200000, 880898400000, 883922400000,
    885736800000, 888760800000, 891180000000, 894200400000, 896619600000,
  ]);
  expect(iteratorDates).toEqual(dates);
});

test('Monthly on the second to last Monday of the month for 6 months', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setCount(6)
    .setByWeekday([Weekday.Monday])
    .setBySetpos([-2]);
  const set = new RRuleSet(
    new RRuleDateTime(873205200000, 'US/Eastern'),
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all().map((d) => d.timestamp);
  const iteratorDates = Array.from(set.occurrences()).map((d) => d.timestamp);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nFREQ=monthly;COUNT=6;BYSETPOS=-2;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO',
  );
  expect(dates).toEqual([
    874933200000, 877352400000, 879775200000, 882799200000, 885218400000,
    887637600000,
  ]);
  expect(iteratorDates).toEqual(dates);
});

test('Monthly on the third to the last day of the month, limit 6', () => {
  const rrule = new RRule(Frequency.Monthly).setByMonthday([-3]);
  const set = new RRuleSet(
    new RRuleDateTime(873205200000, 'US/Eastern'),
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(6).map((d) => d.timestamp);
  const iteratorDates = Array.from(takeN(set.occurrences(), 6)).map(
    (d) => d.timestamp,
  );

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nFREQ=monthly;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    875451600000, 878133600000, 880725600000, 883404000000, 886082400000,
    888501600000,
  ]);
  expect(iteratorDates).toEqual(dates);
});

test('Monthly on the 2nd and 15th of the month for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setCount(10)
    .setByMonthday([2, 15]);
  const set = new RRuleSet(
    new RRuleDateTime(873205200000, 'US/Eastern'),
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all().map((d) => d.timestamp);
  const iteratorDates = Array.from(set.occurrences()).map((d) => d.timestamp);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nFREQ=monthly;COUNT=10;BYMONTHDAY=2,15;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    873205200000, 874328400000, 875797200000, 876920400000, 878479200000,
    879602400000, 881071200000, 882194400000, 883749600000, 884872800000,
  ]);
  expect(iteratorDates).toEqual(dates);
});

test('Monthly on the first and last day of the month for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setCount(10)
    .setByMonthday([1, -1]);
  const set = new RRuleSet(
    new RRuleDateTime(873205200000, 'US/Eastern'),
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all().map((d) => d.timestamp);
  const iteratorDates = Array.from(set.occurrences()).map((d) => d.timestamp);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nFREQ=monthly;COUNT=10;BYMONTHDAY=1;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    875624400000, 875710800000, 878306400000, 878392800000, 880898400000,
    880984800000, 883576800000, 883663200000, 886255200000, 886341600000,
  ]);
  expect(iteratorDates).toEqual(dates);
});

test('Every 18 months on the 10th thru 15th of the month for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setCount(10)
    .setInterval(18)
    .setByMonthday([10, 11, 12, 13, 14, 15]);
  const set = new RRuleSet(
    new RRuleDateTime(873205200000, 'US/Eastern'),
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all().map((d) => d.timestamp);
  const iteratorDates = Array.from(set.occurrences()).map((d) => d.timestamp);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nFREQ=monthly;COUNT=10;INTERVAL=18;BYMONTHDAY=10,11,12,13,14,15;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    873896400000, 873982800000, 874069200000, 874155600000, 874242000000,
    874328400000, 921074400000, 921160800000, 921247200000, 921333600000,
  ]);
  expect(iteratorDates).toEqual(dates);
});

test('Monthly 5 times with two rdates and one exdate', () => {
  const rrule = new RRule(Frequency.Monthly).setCount(5);
  const set = new RRuleSet(
    new RRuleDateTime(new Date('2012-02-01T02:30:00Z'), 'UTC'),
  )
    .addRrule(rrule)
    .addRdate(new Date('2012-07-01T02:30:00Z'))
    .addRdate(new Date('2012-07-02T02:30:00Z'))
    .addExdate(new Date('2012-06-01T02:30:00Z'));

  const dates = set.all().map((d) => d.timestamp);
  const iteratorDates = Array.from(set.occurrences()).map((d) => d.timestamp);

  expect(set.getRdates().map((d) => d.toDate().toISOString())).toEqual([
    '2012-07-01T02:30:00.000Z',
    '2012-07-02T02:30:00.000Z',
  ]);
  expect(set.getExdates().map((d) => d.toDate().toISOString())).toEqual([
    '2012-06-01T02:30:00.000Z',
  ]);
  expect(dates.map((d) => new Date(d).toISOString())).toEqual([
    '2012-02-01T02:30:00.000Z',
    '2012-03-01T02:30:00.000Z',
    '2012-04-01T02:30:00.000Z',
    '2012-05-01T02:30:00.000Z',
    '2012-07-01T02:30:00.000Z',
    '2012-07-02T02:30:00.000Z',
  ]);
  expect(iteratorDates).toEqual(dates);
});

test('Every Tuesday, every other month, limit 18', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setInterval(2)
    .setByWeekday([Weekday.Tuesday]);
  const set = new RRuleSet(
    new RRuleDateTime(873205200000, 'US/Eastern'),
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(18).map((d) => d.timestamp);
  const iteratorDates = Array.from(takeN(set.occurrences(), 18)).map(
    (d) => d.timestamp,
  );

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nFREQ=monthly;INTERVAL=2;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TU',
  );
  expect(dates).toEqual([
    873205200000, 873810000000, 874414800000, 875019600000, 875624400000,
    878652000000, 879256800000, 879861600000, 880466400000, 884095200000,
    884700000000, 885304800000, 885909600000, 888933600000, 889538400000,
    890143200000, 890748000000, 891352800000,
  ]);
  expect(iteratorDates).toEqual(dates);
});

test('Monthly on the second to last Monday of the month for 6 months', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setByWeekday([{ weekday: Weekday.Monday, n: -2 }])
    .setCount(6);
  const set = new RRuleSet(
    new RRuleDateTime(new Date('1997-09-22T09:00:00-04:00'), 'US/Eastern'),
  ).addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(8).map((d) => d.timestamp);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970922T090000\nFREQ=monthly;COUNT=6;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=-2MO',
  );
  expect(dates.map((d) => new Date(d).toISOString())).toEqual([
    '1997-09-22T13:00:00.000Z',
    '1997-10-20T13:00:00.000Z',
    '1997-11-17T14:00:00.000Z',
    '1997-12-22T14:00:00.000Z',
    '1998-01-19T14:00:00.000Z',
    '1998-02-16T14:00:00.000Z',
  ]);
});

test('Errors on invalid by-weekday', () => {
  expect(() =>
    new RRule(Frequency.Monthly).setByWeekday(['invalid' as any]),
  ).toThrowError('Value is non of these types `NWeekday`, `Weekday`');
});
