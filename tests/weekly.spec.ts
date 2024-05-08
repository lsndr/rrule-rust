import { RRule, RRuleSet, Frequency, Weekday } from '../src';

test('Weekly for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Weekly).setCount(10);
  const set = new RRuleSet(19970902090000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;COUNT=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TU',
  );
  expect(dates).toEqual([
    19970902090000, 19970909090000, 19970916090000, 19970923090000,
    19970930090000, 19971007090000, 19971014090000, 19971021090000,
    19971028090000, 19971104090000,
  ]);
});

test('Weekly until December 24, 1997', () => {
  const rrule = new RRule(Frequency.Weekly).setUntil(
    19971224000000,
    'US/Eastern',
  );
  const set = new RRuleSet(19970902090000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;UNTIL=19971224T050000Z;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TU',
  );
  expect(dates).toEqual([
    19970902090000, 19970909090000, 19970916090000, 19970923090000,
    19970930090000, 19971007090000, 19971014090000, 19971021090000,
    19971028090000, 19971104090000, 19971111090000, 19971118090000,
    19971125090000, 19971202090000, 19971209090000, 19971216090000,
    19971223090000,
  ]);
});

test('Every other week - limit 10', () => {
  const rrule = new RRule(Frequency.Weekly)
    .setInterval(2)
    .setWeekstart(Weekday.Sunday);
  const set = new RRuleSet(19970902090000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(10);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;WKST=Sun;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TU',
  );
  expect(dates).toEqual([
    19970902090000, 19970916090000, 19970930090000, 19971014090000,
    19971028090000, 19971111090000, 19971125090000, 19971209090000,
    19971223090000, 19980106090000,
  ]);
});

test('Every other week on Monday, Wednesday and Friday until December 24, 1997, but starting on Tuesday, September 2, 1997', () => {
  const rrule = new RRule(Frequency.Weekly)
    .setInterval(2)
    .setUntil(19971224000000, 'US/Eastern')
    .setWeekstart(Weekday.Sunday)
    .setByWeekday([Weekday.Monday, Weekday.Wednesday, Weekday.Friday]);
  const set = new RRuleSet(19970902090000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;UNTIL=19971224T050000Z;INTERVAL=2;WKST=Sun;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO,WE,FR',
  );
  expect(dates).toEqual([
    // TODO: rrule crate does not include dtstart date (873205200000), create a bug report
    19970903090000,
    19970905090000, 19970915090000, 19970917090000, 19970919090000,
    19970929090000, 19971001090000, 19971003090000, 19971013090000,
    19971015090000, 19971017090000, 19971027090000, 19971029090000,
    19971031090000, 19971110090000, 19971112090000, 19971114090000,
    19971124090000, 19971126090000, 19971128090000, 19971208090000,
    19971210090000, 19971212090000, 19971222090000,
  ]);
});
