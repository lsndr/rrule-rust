import { Frequency, Weekday, RRule, RRuleSet, DateTime } from '../src';

test('Should properly parse weekly recurrence', () => {
  const set = RRuleSet.parse(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;WKST=SU;BYDAY=MO,WE,FR',
  );
  const asString = set.toString();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;UNTIL=19971224T000000Z;INTERVAL=2;WKST=Sun;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO,WE,FR',
  );
});

test('Should properly parse monthly recurrence', () => {
  const set = RRuleSet.parse(
    'DTSTART;TZID=US/Eastern:19970907T090000\nRRULE:FREQ=MONTHLY;INTERVAL=2;COUNT=10;BYDAY=1SU,-1SU',
  );
  const asString = set.toString();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970907T090000\nRRULE:FREQ=MONTHLY;COUNT=10;INTERVAL=2;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=-1SU,SU',
  );
});

test('Should throw error on missing start date', () => {
  expect(() => RRuleSet.parse('FREQ=monthly;COUNT=10;INTERVAL=2')).toThrowError(
    'RRule parsing error: Missing start date. There needs to be a unique start date which the iteration can start from.',
  );
});

test('Should throw error on invalid rule set', () => {
  expect(() => RRuleSet.parse('Invalid')).toThrowError(
    'RRule parsing error: `Invalid` is a malformed property parameter. Parameter should be specified as `key=value`',
  );
});

test('Should throw error on invalid timezone', () => {
  expect(() =>
    RRuleSet.parse('DTSTART;TZID=Invalid:19970907T090000'),
  ).toThrowError('RRule parsing error: `Invalid` is not a valid timezone.');
});

test('Should throw error on invalid recurrence rule', () => {
  expect(() =>
    RRuleSet.parse('DTSTART;TZID=US/Eastern:19970907T090000\nRRULE:Invalid'),
  ).toThrowError(
    'RRule parsing error: `Invalid` is a malformed property parameter. Parameter should be specified as `key=value`',
  );
});

test('Should throw error on invalid frequency', () => {
  expect(() =>
    RRuleSet.parse(
      'DTSTART;TZID=US/Eastern:19970907T090000\nRRULE:FREQ=Invalid',
    ),
  ).toThrowError('RRule parsing error: `INVALID` is not a valid frequency.');
});

test('Should throw error on invalid interval', () => {
  expect(() =>
    RRuleSet.parse(
      'DTSTART;TZID=US/Eastern:19970907T090000\nRRULE:FREQ=DAILY;INTERVAL=Invalid',
    ),
  ).toThrowError(
    'RRule parsing error: `Invalid` is not a valid INTERVAL value.',
  );
});

test('Should throw error on invalid count', () => {
  expect(() =>
    RRuleSet.parse(
      'DTSTART;TZID=US/Eastern:19970907T090000\nRRULE:FREQ=DAILY;COUNT=Invalid',
    ),
  ).toThrowError('RRule parsing error: `Invalid` is not a valid COUNT value.');
});

test('Should throw error on invalid until', () => {
  expect(() =>
    RRuleSet.parse(
      'DTSTART;TZID=US/Eastern:19970907T090000\nRRULE:FREQ=DAILY;UNTIL=Invalid',
    ),
  ).toThrowError(
    'RRule parsing error: `Invalid` is not a valid datetime format for `UNTIL`.',
  );
});

test('Should throw error on invalid week start', () => {
  expect(() =>
    RRuleSet.parse(
      'DTSTART;TZID=US/Eastern:19970907T090000\nRRULE:FREQ=DAILY;WKST=Invalid',
    ),
  ).toThrowError(
    'RRule parsing error: `Invalid` is not a valid weekday start. Valid values are `MO`, `TU`, `WE`, `TH`, `FR`, `SA` and `SU`.',
  );
});

test('Should properly parse weekly individual recurrence rule', () => {
  const rule = RRule.parse(
    'FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;WKST=SU;BYDAY=MO,WE,FR',
  );

  expect(rule.frequency).toBe(Frequency.Weekly);
  expect(rule.interval).toBe(2);
  expect(rule.until).toEqual(DateTime.create(1997, 12, 24, 0, 0, 0, true));
  expect(rule.weekstart).toBe(Weekday.Sunday);
  expect(rule.byWeekday).toEqual([
    { weekday: Weekday.Monday },
    { weekday: Weekday.Wednesday },
    { weekday: Weekday.Friday },
  ]);

  const asString = rule.toString();
  expect(asString).toBe(
    'FREQ=WEEKLY;UNTIL=19971224T000000Z;INTERVAL=2;WKST=Sun;BYDAY=MO,WE,FR',
  );
});

test('Should properly parse individual recurrence rule with RRULE prefix', () => {
  const rule = RRule.parse(
    'RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;WKST=SU;BYDAY=MO,WE,FR',
  );

  const asString = rule.toString();
  expect(asString).toBe(
    'FREQ=WEEKLY;UNTIL=19971224T000000Z;INTERVAL=2;WKST=Sun;BYDAY=MO,WE,FR',
  );
});

test('Should properly parse monthly individual recurrence rule', () => {
  const rule = RRule.parse('FREQ=MONTHLY;INTERVAL=2;COUNT=10;BYDAY=1SU,-1SU');
  expect(rule.frequency).toBe(Frequency.Monthly);
  expect(rule.interval).toBe(2);
  expect(rule.count).toBe(10);

  // TODO: NWeekday not supported yet
  //expect(rule.byWeekday)

  const asString = rule.toString();
  expect(asString).toBe('FREQ=MONTHLY;COUNT=10;INTERVAL=2;BYDAY=SU,-1SU');
});

test('Should throw error on invalid individual recurrence rule', () => {
  expect(() => RRule.parse('Invalid')).toThrowError('Invalid rrule value');
});

test('Should throw error on invalid individual recurrence rule frequency', () => {
  expect(() => RRule.parse('FREQ=Invalid')).toThrowError(
    'Invalid frequency: Invalid',
  );
});

test('Should throw error on invalid individual recurrence rule interval', () => {
  expect(() => RRule.parse('FREQ=DAILY;INTERVAL=Invalid')).toThrowError(
    'Invalid interval: Invalid',
  );
});

test('Should throw error on invalid individual recurrence rule until', () => {
  expect(() => RRule.parse('FREQ=DAILY;UNTIL=Invalid')).toThrowError(
    'Invalid datetime string: Invalid',
  );
});

test('Should throw error on invalid individual recurrence rule week start', () => {
  expect(() => RRule.parse('FREQ=DAILY;WKST=Invalid')).toThrowError(
    'Invalid weekday: Invalid',
  );
});

test('Should be able to parse rule set without dtstart', () => {
  const set = new RRuleSet(
    DateTime.create(1997, 9, 2, 9, 0, 0, false),
    'US/Eastern',
  ).setFromString(
    'RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;WKST=SU;BYDAY=MO,WE,FR',
  );

  expect(set.toString()).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;UNTIL=19971224T000000Z;INTERVAL=2;WKST=Sun;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO,WE,FR',
  );
});
