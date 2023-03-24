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
