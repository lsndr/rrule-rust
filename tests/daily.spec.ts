import { RRule, RRuleSet, Frequency, Month, Weekday } from '../src';

test('Daily for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Daily).setCount(10);
  const set = new RRuleSet(19970902090000, 'US/Eastern').addRrule(rrule);

  const dates = set.all();
  const asString = set.toString();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;COUNT=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    19970902090000, 19970903090000, 19970904090000, 19970905090000,
    19970906090000, 19970907090000, 19970908090000, 19970909090000,
    19970910090000, 19970911090000,
  ]);
});

test('Daily for 10 occurrences between 873550800000 and 873723600000 inclusively', () => {
  const rrule = new RRule(Frequency.Daily).setCount(10);
  const set = new RRuleSet(19970902090000, 'US/Eastern').addRrule(rrule);

  const dates = set.between(19970906090000, 19970908090000, true);
  const asString = set.toString();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;COUNT=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([19970906090000, 19970907090000, 19970908090000]);
});

test('Daily for 10 occurrences between 873550800000 and 873723600000 exclusively', () => {
  const rrule = new RRule(Frequency.Daily).setCount(10);
  const set = new RRuleSet(19970902090000, 'US/Eastern').addRrule(rrule);

  const dates = set.between(19970906090000, 19970908090000, false);
  const asString = set.toString();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;COUNT=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([19970907090000]);
});

test('Daily until September 7, 1997', () => {
  const rrule = new RRule(Frequency.Daily).setUntil(19970907000000);
  const set = new RRuleSet(19970902090000, 'US/Eastern').addRrule(rrule);

  const dates = set.all();
  const asString = set.toString();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;UNTIL=19970907T000000Z;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    19970902090000, 19970903090000, 19970904090000, 19970905090000,
    19970906090000,
  ]);
});

test('Every other day', () => {
  const rrule = new RRule(Frequency.Daily).setCount(6).setInterval(2);
  const set = new RRuleSet(19970902090000, 'US/Eastern').addRrule(rrule);

  const dates = set.all();
  const asString = set.toString();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;COUNT=6;INTERVAL=2;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    19970902090000, 19970904090000, 19970906090000, 19970908090000,
    19970910090000, 19970912090000,
  ]);
});

test('Every 10 days, 5 occurrences', () => {
  const rrule = new RRule(Frequency.Daily).setCount(5).setInterval(10);
  const set = new RRuleSet(19970902090000, 'US/Eastern').addRrule(rrule);

  const dates = set.all();
  const asString = set.toString();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;COUNT=5;INTERVAL=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    19970902090000, 19970912090000, 19970922090000, 19971002090000,
    19971012090000,
  ]);
});

test('Every Monday in January, for 3 years', () => {
  const rrule = new RRule(Frequency.Daily)
    .setByMonth([Month.January])
    .setByWeekday([Weekday.Monday])
    .setUntil(20000131140000);
  const set = new RRuleSet(19970902090000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=DAILY;UNTIL=20000131T140000Z;BYMONTH=1;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO',
  );
  expect(dates).toEqual([
    19980105090000, 19980112090000, 19980119090000, 19980126090000,
    19990104090000, 19990111090000, 19990118090000, 19990125090000,
    20000103090000, 20000110090000, 20000117090000, 20000124090000,
    20000131090000,
  ]);
});

test('Every Monday in January, for 3 years except Jan 31 2000', () => {
  const rrule = new RRule(Frequency.Daily)
    .setByMonth([Month.January])
    .setByWeekday([Weekday.Monday])
    .setUntil(20000131140000);
  const set = new RRuleSet(19970902090000, 'US/Eastern')
    .addRrule(rrule)
    .addExdate(20000131090000);

  const dates = set.all();
  expect(dates).toEqual([
    19980105090000, 19980112090000, 19980119090000, 19980126090000,
    19990104090000, 19990111090000, 19990118090000, 19990125090000,
    20000103090000, 20000110090000, 20000117090000, 20000124090000,
  ]);
  expect(set.rrules.map((rrule) => rrule.toString())).toEqual([
    'FREQ=DAILY;UNTIL=20000131T140000Z;BYMONTH=1;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO',
  ]);
  expect(set.exrules.map((rrule) => rrule.toString())).toEqual([]);
});
