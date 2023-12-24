import { RRuleSet } from '../';

test('Should properly parse weekly recurrence', () => {
  const set = RRuleSet.parse(
    'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;WKST=SU;BYDAY=MO,WE,FR',
  );
  const asString = set.toString();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970902T090000\nFREQ=weekly;UNTIL=19971224T000000Z;INTERVAL=2;WKST=Sun;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO,WE,FR',
  );
});

test('Should properly parse monthly recurrence', () => {
  const set = RRuleSet.parse(
    'DTSTART;TZID=US/Eastern:19970907T090000\nRRULE:FREQ=MONTHLY;INTERVAL=2;COUNT=10;BYDAY=1SU,-1SU',
  );
  const asString = set.toString();

  expect(asString).toBe(
    'DTSTART;TZID=US/Eastern:19970907T090000\nFREQ=monthly;COUNT=10;INTERVAL=2;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=-1SU,SU',
  );
});

test('Should throw error on missing start date', () => {
  expect(() => RRuleSet.parse('Invalid')).toThrowError(
    'RRule parsing error: Missing start date. There needs to be a unique start date which the iteration can start from.',
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
