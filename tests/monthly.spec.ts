import { RRule, RRuleSet, Frequency, Weekday } from '../src';

test('Monthly on the 1st Friday for ten occurrences', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setCount(10)
    .setByWeekday([Weekday.Friday])
    .setBySetpos([1]);
  const set = new RRuleSet(199709020900000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=10;BYSETPOS=1;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=FR',
  );
  expect(dates).toEqual([
    199709050900000, 199710030900000, 199711070900000, 199712050900000,
    199801020900000, 199802060900000, 199803060900000, 199804030900000,
    199805010900000, 199806050900000,
  ]);
});

test('Monthly on the 1st Friday until December 24, 1997', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setUntil(199712240000000)
    .setByWeekday([Weekday.Friday])
    .setBySetpos([1]);
  const set = new RRuleSet(199709020900000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;UNTIL=19971224T050000Z;BYSETPOS=1;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=FR',
  );
  expect(dates).toEqual([
    199709050900000, 199710030900000, 199711070900000, 199712050900000,
  ]);
});

test('Every other month on the 1st and last Sunday of the month for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setInterval(2)
    .setCount(10)
    .setByWeekday([Weekday.Sunday, Weekday.Sunday])
    .setBySetpos([1, -1]);
  const set = new RRuleSet(199709020900000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=10;INTERVAL=2;BYSETPOS=-1,1;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=SU',
  );
  expect(dates).toEqual([
    199709070900000, 199709280900000, 199711020900000, 199711300900000,
    199801040900000, 199801250900000, 199803010900000, 199803290900000,
    199805030900000, 199805310900000,
  ]);
});

test('Monthly on the second to last Monday of the month for 6 months', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setCount(6)
    .setByWeekday([Weekday.Monday])
    .setBySetpos([-2]);
  const set = new RRuleSet(199709020900000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=6;BYSETPOS=-2;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO',
  );
  expect(dates).toEqual([
    199709220900000, 199710200900000, 199711170900000, 199712220900000,
    199801190900000, 199802160900000,
  ]);
});

test('Monthly on the third to the last day of the month, limit 6', () => {
  const rrule = new RRule(Frequency.Monthly).setByMonthday([-3]);
  const set = new RRuleSet(199709020900000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(6);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    199709280900000, 199710290900000, 199711280900000, 199712290900000,
    199801290900000, 199802260900000,
  ]);
});

test('Monthly on the 2nd and 15th of the month for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setCount(10)
    .setByMonthday([2, 15]);
  const set = new RRuleSet(199709020900000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=10;BYMONTHDAY=2,15;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    199709020900000, 199709150900000, 199710020900000, 199710150900000,
    199711020900000, 199711150900000, 199712020900000, 199712150900000,
    199801020900000, 199801150900000,
  ]);
});

test('Monthly on the first and last day of the month for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setCount(10)
    .setByMonthday([1, -1]);
  const set = new RRuleSet(199709020900000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=10;BYMONTHDAY=1;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    199709300900000, 199710010900000, 199710310900000, 199711010900000,
    199711300900000, 199712010900000, 199712310900000, 199801010900000,
    199801310900000, 199802010900000,
  ]);
});

test('Every 18 months on the 10th thru 15th of the month for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setCount(10)
    .setInterval(18)
    .setByMonthday([10, 11, 12, 13, 14, 15]);
  const set = new RRuleSet(199709020900000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=10;INTERVAL=18;BYMONTHDAY=10,11,12,13,14,15;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    199709100900000, 199709110900000, 199709120900000, 199709130900000,
    199709140900000, 199709150900000, 199903100900000, 199903110900000,
    199903120900000, 199903130900000,
  ]);
});

test('Monthly 5 times with two rdates and one exdate', () => {
  const rrule = new RRule(Frequency.Monthly).setCount(5);
  const set = new RRuleSet(201202010230000, 'UTC')
    .addRrule(rrule)
    .addRdate(201207010230000)
    .addRdate(201207020230000)
    .addExdate(201206010230000);

  expect(set.rdates).toEqual([201207010230000, 201207020230000]);
  expect(set.exdates).toEqual([201206010230000]);
  expect(set.all()).toEqual([
    201202010230001, 201203010230001, 201204010230001, 201205010230001,
    201207010230001, 201207020230001,
  ]);
});

test('Every Tuesday, every other month, limit 18', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setInterval(2)
    .setByWeekday([Weekday.Tuesday]);
  const set = new RRuleSet(199709020900000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(18);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;INTERVAL=2;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TU',
  );
  expect(dates).toEqual([
    199709020900000, 199709090900000, 199709160900000, 199709230900000,
    199709300900000, 199711040900000, 199711110900000, 199711180900000,
    199711250900000, 199801060900000, 199801130900000, 199801200900000,
    199801270900000, 199803030900000, 199803100900000, 199803170900000,
    199803240900000, 199803310900000,
  ]);
});

test('Monthly on the second to last Monday of the month for 6 months 1', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setByWeekday([{ weekday: Weekday.Monday, n: -2 }])
    .setCount(6);
  const set = new RRuleSet(199709220900000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(8);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970922T090000\nRRULE:FREQ=MONTHLY;COUNT=6;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=-2MO',
  );
  expect(dates).toEqual([
    199709220900000, 199710200900000, 199711170900000, 199712220900000,
    199801190900000, 199802160900000,
  ]);
});

test('Errors on invalid by-weekday', () => {
  expect(() =>
    new RRule(Frequency.Monthly).setByWeekday(['invalid' as any]).toString(),
  ).toThrow('Value is non of these types `NWeekday`, `Weekday`');
});
