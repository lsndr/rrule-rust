const test = require('ava');
const { RRule, RRuleSet, Frequency, Month, Weekday } = require('../');

test('Should properly parse weekly recurrence', (t) => {
    const set = RRuleSet.parse('DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;WKST=SU;BYDAY=MO,WE,FR');
    const asString = set.toString();

    t.is(asString, 'DTSTART;TZID=US/Eastern:19970902T090000\nFREQ=weekly;UNTIL=19971224T000000Z;INTERVAL=2;WKST=Sun;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO,WE,FR');
});
