import { RRule, RRuleSet, Frequency, Weekday } from '../src';

test('Monthly on the 1st Friday for ten occurrences', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setCount(10)
    .setByWeekday([Weekday.Friday])
    .setBySetpos([1]);
  const set = new RRuleSet(19970902090000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=10;BYSETPOS=1;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=FR',
  );
  expect(dates).toEqual([
    19970905090000, 19971003090000, 19971107090000, 19971205090000,
    19980102090000, 19980206090000, 19980306090000, 19980403090000,
    19980501090000, 19980605090000,
  ]);
});

test('Monthly on the 1st Friday until December 24, 1997', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setUntil(19971224000000, 'US/Eastern')
    .setByWeekday([Weekday.Friday])
    .setBySetpos([1]);
  const set = new RRuleSet(19970902090000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;UNTIL=19971224T050000Z;BYSETPOS=1;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=FR',
  );
  expect(dates).toEqual([
    19970905090000, 19971003090000, 19971107090000, 19971205090000,
  ]);
});

test('Every other month on the 1st and last Sunday of the month for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setInterval(2)
    .setCount(10)
    .setByWeekday([Weekday.Sunday, Weekday.Sunday])
    .setBySetpos([1, -1]);
  const set = new RRuleSet(19970902090000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=10;INTERVAL=2;BYSETPOS=-1,1;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=SU',
  );
  expect(dates).toEqual([
    19970907090000, 19970928090000, 19971102090000, 19971130090000,
    19980104090000, 19980125090000, 19980301090000, 19980329090000,
    19980503090000, 19980531090000,
  ]);
});

test('Monthly on the second to last Monday of the month for 6 months', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setCount(6)
    .setByWeekday([Weekday.Monday])
    .setBySetpos([-2]);
  const set = new RRuleSet(19970902090000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=6;BYSETPOS=-2;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO',
  );
  expect(dates).toEqual([
    19970922090000, 19971020090000, 19971117090000, 19971222090000,
    19980119090000, 19980216090000,
  ]);
});

test('Monthly on the third to the last day of the month, limit 6', () => {
  const rrule = new RRule(Frequency.Monthly).setByMonthday([-3]);
  const set = new RRuleSet(19970902090000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(6);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    19970928090000, 19971029090000, 19971128090000, 19971229090000,
    19980129090000, 19980226090000,
  ]);
});

test('Monthly on the 2nd and 15th of the month for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setCount(10)
    .setByMonthday([2, 15]);
  const set = new RRuleSet(19970902090000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=10;BYMONTHDAY=2,15;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    19970902090000, 19970915090000, 19971002090000, 19971015090000,
    19971102090000, 19971115090000, 19971202090000, 19971215090000,
    19980102090000, 19980115090000,
  ]);
});

test('Monthly on the first and last day of the month for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setCount(10)
    .setByMonthday([1, -1]);
  const set = new RRuleSet(19970902090000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=10;BYMONTHDAY=1;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    19970930090000, 19971001090000, 19971031090000, 19971101090000,
    19971130090000, 19971201090000, 19971231090000, 19980101090000,
    19980131090000, 19980201090000,
  ]);
});

test('Every 18 months on the 10th thru 15th of the month for 10 occurrences', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setCount(10)
    .setInterval(18)
    .setByMonthday([10, 11, 12, 13, 14, 15]);
  const set = new RRuleSet(19970902090000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=10;INTERVAL=18;BYMONTHDAY=10,11,12,13,14,15;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  expect(dates).toEqual([
    19970910090000, 19970911090000, 19970912090000, 19970913090000,
    19970914090000, 19970915090000, 19990310090000, 19990311090000,
    19990312090000, 19990313090000,
  ]);
});

test('Monthly 5 times with two rdates and one exdate', () => {
  const rrule = new RRule(Frequency.Monthly).setCount(5);
  const set = new RRuleSet(20120201023000, 'UTC')
    .addRrule(rrule)
    .addRdate(20120701023000)
    .addRdate(20120702023000)
    .addExdate(20120601023000);

  const dates = set.all();

  expect(set.rdates).toEqual([20120701023000, 20120702023000]);
  expect(set.exdates).toEqual([20120601023000]);
  expect(dates).toEqual([
    20120201023000, 20120301023000, 20120401023000, 20120501023000,
    20120701023000, 20120702023000,
  ]);
});

test('Every Tuesday, every other month, limit 18', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setInterval(2)
    .setByWeekday([Weekday.Tuesday]);
  const set = new RRuleSet(19970902090000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(18);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=MONTHLY;INTERVAL=2;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=TU',
  );
  expect(dates).toEqual([
    19970902090000, 19970909090000, 19970916090000, 19970923090000,
    19970930090000, 19971104090000, 19971111090000, 19971118090000,
    19971125090000, 19980106090000, 19980113090000, 19980120090000,
    19980127090000, 19980303090000, 19980310090000, 19980317090000,
    19980324090000, 19980331090000,
  ]);
});

test('Monthly on the second to last Monday of the month for 6 months', () => {
  const rrule = new RRule(Frequency.Monthly)
    .setByWeekday([{ weekday: Weekday.Monday, n: -2 }])
    .setCount(6);
  const set = new RRuleSet(19970922090000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all(8);

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970922T090000\nRRULE:FREQ=MONTHLY;COUNT=6;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=-2MO',
  );
  expect(dates).toEqual([
    19970922090000, 19971020090000, 19971117090000, 19971222090000,
    19980119090000, 19980216090000,
  ]);
});

test('Errors on invalid by-weekday', () => {
  expect(() =>
    new RRule(Frequency.Monthly).setByWeekday(['invalid' as any]),
  ).toThrow('Value is non of these types `NWeekday`, `Weekday`');
});
