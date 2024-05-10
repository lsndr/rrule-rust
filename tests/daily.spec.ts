import { RRule, RRuleSet, Frequency, Month, Weekday } from '../src';

test('Daily for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Daily).setCount(10);
  const set = new RRuleSet(199709020900000, 'US/Eastern').addRrule(rrule);

  const dates = set.all();
  const asString = set.toString();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;COUNT=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    199709020900000, 199709030900000, 199709040900000, 199709050900000,
    199709060900000, 199709070900000, 199709080900000, 199709090900000,
    199709100900000, 199709110900000,
  ]);
});

test('Daily for 10 occurrences between 873550800000 and 873723600000 inclusively', () => {
  const rrule = new RRule(Frequency.Daily).setCount(10);
  const set = new RRuleSet(199709020900000, 'US/Eastern').addRrule(rrule);

  const dates = set.between(199709060900000, 199709080900000, true);
  const asString = set.toString();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;COUNT=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([199709060900000, 199709070900000, 199709080900000]);
});

test('Daily for 10 occurrences between 873550800000 and 873723600000 exclusively', () => {
  const rrule = new RRule(Frequency.Daily).setCount(10);
  const set = new RRuleSet(199709020900000, 'US/Eastern').addRrule(rrule);

  const dates = set.between(199709060900000, 199709080900000, false);
  const asString = set.toString();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;COUNT=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([199709070900000]);
});

test('Daily until September 7, 1997', () => {
  const rrule = new RRule(Frequency.Daily).setUntil(199709060900000);
  const set = new RRuleSet(199709020900000, 'US/Eastern').addRrule(rrule);

  const dates = set.all();
  const asString = set.toString();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;UNTIL=19970906T130000Z;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    199709020900000, 199709030900000, 199709040900000, 199709050900000,
    199709060900000,
  ]);
});

test('Every other day', () => {
  const rrule = new RRule(Frequency.Daily).setCount(6).setInterval(2);
  const set = new RRuleSet(199709020900000, 'US/Eastern').addRrule(rrule);

  const dates = set.all();
  const asString = set.toString();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;COUNT=6;INTERVAL=2;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    199709020900000, 199709040900000, 199709060900000, 199709080900000,
    199709100900000, 199709120900000,
  ]);
});

test('Every 10 days, 5 occurrences', () => {
  const rrule = new RRule(Frequency.Daily).setCount(5).setInterval(10);
  const set = new RRuleSet(199709020900000, 'US/Eastern').addRrule(rrule);

  const dates = set.all();
  const asString = set.toString();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;COUNT=5;INTERVAL=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    199709020900000, 199709120900000, 199709220900000, 199710020900000,
    199710120900000,
  ]);
});

test('Every Monday in January, for 3 years', () => {
  const rrule = new RRule(Frequency.Daily)
    .setByMonth([Month.January])
    .setByWeekday([Weekday.Monday])
    .setUntil(200001311400000);
  const set = new RRuleSet(199709020900000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;UNTIL=20000131T190000Z;BYMONTH=1;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO',
  );
  expect(dates).toEqual([
    199801050900000, 199801120900000, 199801190900000, 199801260900000,
    199901040900000, 199901110900000, 199901180900000, 199901250900000,
    200001030900000, 200001100900000, 200001170900000, 200001240900000,
    200001310900000,
  ]);
});

test('Every Monday in January, for 3 years except Jan 31 2000', () => {
  const rrule = new RRule(Frequency.Daily)
    .setByMonth([Month.January])
    .setByWeekday([Weekday.Monday])
    .setUntil(200001311400000);

  const set = new RRuleSet(199709020900000, 'Asia/Tbilisi')
    .addRrule(rrule)
    .addExdate(200001310900000);

  expect(set.all()).toEqual([
    199801050900000, 199801120900000, 199801190900000, 199801260900000,
    199901040900000, 199901110900000, 199901180900000, 199901250900000,
    200001030900000, 200001100900000, 200001170900000, 200001240900000,
  ]);
  expect(set.rrules.map((rrule) => rrule.toString())).toEqual([
    'FREQ=DAILY;UNTIL=20000131T140000;BYMONTH=1;BYDAY=MO',
  ]);
  expect(set.exrules).toEqual([]);
});
