import { RRule, RRuleSet, Frequency, Month, Weekday } from '../src';

test('Daily for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Daily).setCount(10);
  const set = new RRuleSet(873205200000, 'US/Eastern').addRrule(rrule);

  const dates = set.all();
  const asString = set.toString();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;COUNT=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    873205200000, 873291600000, 873378000000, 873464400000, 873550800000,
    873637200000, 873723600000, 873810000000, 873896400000, 873982800000,
  ]);
});

test('Daily for 10 occurrences between 873550800000 and 873723600000 inclusively', () => {
  const rrule = new RRule(Frequency.Daily).setCount(10);
  const set = new RRuleSet(873205200000, 'US/Eastern').addRrule(rrule);

  const dates = set.between(873550800000, 873723600000, true);
  const asString = set.toString();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;COUNT=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([873550800000, 873637200000, 873723600000]);
});

test('Daily for 10 occurrences between 873550800000 and 873723600000 exclusively', () => {
  const rrule = new RRule(Frequency.Daily).setCount(10);
  const set = new RRuleSet(873205200000, 'US/Eastern').addRrule(rrule);

  const dates = set.between(873550800000, 873723600000, false);
  const asString = set.toString();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;COUNT=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([873637200000]);
});

test('Daily until September 7, 1997', () => {
  const rrule = new RRule(Frequency.Daily).setUntil(873590400000);
  const set = new RRuleSet(873205200000, 'US/Eastern').addRrule(rrule);

  const dates = set.all();
  const asString = set.toString();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;UNTIL=19970907T000000Z;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    873205200000, 873291600000, 873378000000, 873464400000, 873550800000,
  ]);
});

test('Every other day', () => {
  const rrule = new RRule(Frequency.Daily).setCount(6).setInterval(2);
  const set = new RRuleSet(873205200000, 'US/Eastern').addRrule(rrule);

  const dates = set.all();
  const asString = set.toString();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;COUNT=6;INTERVAL=2;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    873205200000, 873378000000, 873550800000, 873723600000, 873896400000,
    874069200000,
  ]);
});

test('Every 10 days, 5 occurrences', () => {
  const rrule = new RRule(Frequency.Daily).setCount(5).setInterval(10);
  const set = new RRuleSet(873205200000, 'US/Eastern').addRrule(rrule);

  const dates = set.all();
  const asString = set.toString();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;COUNT=5;INTERVAL=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    873205200000, 874069200000, 874933200000, 875797200000, 876661200000,
  ]);
});

test('Every Monday in January, for 3 years', () => {
  const rrule = new RRule(Frequency.Daily)
    .setByMonth([Month.January])
    .setByWeekday([Weekday.Monday])
    .setUntil(949327200000);
  const set = new RRuleSet(873205200000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;UNTIL=20000131T140000Z;BYMONTH=1;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO',
  );
  expect(dates).toEqual([
    884008800000, 884613600000, 885218400000, 885823200000, 915458400000,
    916063200000, 916668000000, 917272800000, 946908000000, 947512800000,
    948117600000, 948722400000, 949327200000,
  ]);
});

test('Every Monday in January, for 3 years except Jan 31 2000', () => {
  const rrule = new RRule(Frequency.Daily)
    .setByMonth([Month.January])
    .setByWeekday([Weekday.Monday])
    .setUntil(949327200000);
  const set = new RRuleSet(873205200000, 'US/Eastern')
    .addRrule(rrule)
    .addExdate(949327200000);

  const dates = set.all();
  expect(dates).toEqual([
    884008800000, 884613600000, 885218400000, 885823200000, 915458400000,
    916063200000, 916668000000, 917272800000, 946908000000, 947512800000,
    948117600000, 948722400000,
  ]);
  expect(set.getRrules().map((r) => r.toString())).toEqual([
    'FREQ=DAILY;UNTIL=20000131T140000Z;BYMONTH=1;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO',
  ]);
  expect(set.getExrules().map((r) => r.toString())).toEqual([]);
});
