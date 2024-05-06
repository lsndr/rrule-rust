import { RRule, RRuleSet, Frequency, Weekday } from '../src';

test('Weekly for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Weekly).setCount(10);
  const set = new RRuleSet(873205200000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;COUNT=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TU',
  );
  expect(dates).toEqual([
    873205200000, 873810000000, 874414800000, 875019600000, 875624400000,
    876229200000, 876834000000, 877438800000, 878047200000, 878652000000,
  ]);
});

test('Weekly until December 24, 1997', () => {
  const rrule = new RRule(Frequency.Weekly).setUntil(882921600000);
  const set = new RRuleSet(873205200000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;UNTIL=19971224T000000Z;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TU',
  );
  expect(dates).toEqual([
    873205200000, 873810000000, 874414800000, 875019600000, 875624400000,
    876229200000, 876834000000, 877438800000, 878047200000, 878652000000,
    879256800000, 879861600000, 880466400000, 881071200000, 881676000000,
    882280800000, 882885600000,
  ]);
});

test('Every other week - limit 10', () => {
  const rrule = new RRule(Frequency.Weekly)
    .setInterval(2)
    .setWeekstart(Weekday.Sunday);
  const set = new RRuleSet(873205200000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(10);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;WKST=Sun;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TU',
  );
  expect(dates).toEqual([
    873205200000, 874414800000, 875624400000, 876834000000, 878047200000,
    879256800000, 880466400000, 881676000000, 882885600000, 884095200000,
  ]);
});

test('Every other week on Monday, Wednesday and Friday until December 24, 1997, but starting on Tuesday, September 2, 1997', () => {
  const rrule = new RRule(Frequency.Weekly)
    .setInterval(2)
    .setUntil(882921600000)
    .setWeekstart(Weekday.Sunday)
    .setByWeekday([Weekday.Monday, Weekday.Wednesday, Weekday.Friday]);
  const set = new RRuleSet(873205200000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;UNTIL=19971224T000000Z;INTERVAL=2;WKST=Sun;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO,WE,FR',
  );
  expect(dates).toEqual([
    // TODO: rrule crate does not include dtstart date (873205200000), create a bug report
    873291600000,
    873464400000, 874328400000, 874501200000, 874674000000, 875538000000,
    875710800000, 875883600000, 876747600000, 876920400000, 877093200000,
    877960800000, 878133600000, 878306400000, 879170400000, 879343200000,
    879516000000, 880380000000, 880552800000, 880725600000, 881589600000,
    881762400000, 881935200000, 882799200000,
  ]);
});
