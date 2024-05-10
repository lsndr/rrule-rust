import { RRule, RRuleSet, Frequency, Weekday } from '../src';

test('Weekly for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Weekly).setCount(10);
  const set = new RRuleSet(199709020900000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;COUNT=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TU',
  );
  expect(dates).toEqual([
    199709020900000, 199709090900000, 199709160900000, 199709230900000,
    199709300900000, 199710070900000, 199710140900000, 199710210900000,
    199710280900000, 199711040900000,
  ]);
});

test('Weekly until December 24, 1997', () => {
  const rrule = new RRule(Frequency.Weekly).setUntil(199712240000000);
  const set = new RRuleSet(199709020900000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;UNTIL=19971224T050000Z;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TU',
  );
  expect(dates).toEqual([
    199709020900000, 199709090900000, 199709160900000, 199709230900000,
    199709300900000, 199710070900000, 199710140900000, 199710210900000,
    199710280900000, 199711040900000, 199711110900000, 199711180900000,
    199711250900000, 199712020900000, 199712090900000, 199712160900000,
    199712230900000,
  ]);
});

test('Every other week - limit 10', () => {
  const rrule = new RRule(Frequency.Weekly)
    .setInterval(2)
    .setWeekstart(Weekday.Sunday);
  const set = new RRuleSet(199709020900000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(10);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;WKST=Sun;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TU',
  );
  expect(dates).toEqual([
    199709020900000, 199709160900000, 199709300900000, 199710140900000,
    199710280900000, 199711110900000, 199711250900000, 199712090900000,
    199712230900000, 199801060900000,
  ]);
});

test('Every other week on Monday, Wednesday and Friday until December 24, 1997, but starting on Tuesday, September 2, 1997', () => {
  const rrule = new RRule(Frequency.Weekly)
    .setInterval(2)
    .setUntil(199712240000000)
    .setWeekstart(Weekday.Sunday)
    .setByWeekday([Weekday.Monday, Weekday.Wednesday, Weekday.Friday]);
  const set = new RRuleSet(199709020900000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;UNTIL=19971224T050000Z;INTERVAL=2;WKST=Sun;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO,WE,FR',
  );
  expect(dates).toEqual([
    // TODO: rrule crate does not include dtstart date (873205200000), create a bug report
    199709030900000,
    199709050900000, 199709150900000, 199709170900000, 199709190900000,
    199709290900000, 199710010900000, 199710030900000, 199710130900000,
    199710150900000, 199710170900000, 199710270900000, 199710290900000,
    199710310900000, 199711100900000, 199711120900000, 199711140900000,
    199711240900000, 199711260900000, 199711280900000, 199712080900000,
    199712100900000, 199712120900000, 199712220900000,
  ]);
});
