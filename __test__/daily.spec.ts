// eslint-disable-next-line import/no-unresolved -- https://github.com/avajs/ava/pull/3128
import test from 'ava';
import { RRule, RRuleSet, Frequency, Month, Weekday } from '../';

test('Daily for 10 occurrences', (t) => {
  const rrule = new RRule(Frequency.Daily).setCount(10);
  const set = new RRuleSet(873205200000, 'US/Eastern').addRrule(rrule);

  const dates = set.all();
  const asString = set.toString();

  t.is(
    asString,
    'DTSTART;TZID=US/Eastern:19970902T090000\nFREQ=daily;COUNT=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  t.deepEqual(
    dates,
    [
      873205200000, 873291600000, 873378000000, 873464400000, 873550800000,
      873637200000, 873723600000, 873810000000, 873896400000, 873982800000,
    ],
  );
});

test('Daily for 10 occurrences between 873550800000 and 873723600000 inclusively', (t) => {
  const rrule = new RRule(Frequency.Daily).setCount(10);
  const set = new RRuleSet(873205200000, 'US/Eastern').addRrule(rrule);

  const dates = set.between(873550800000, 873723600000, true);
  const asString = set.toString();

  t.is(
    asString,
    'DTSTART;TZID=US/Eastern:19970902T090000\nFREQ=daily;COUNT=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  t.deepEqual(dates, [873550800000, 873637200000, 873723600000]);
});

test('Daily for 10 occurrences between 873550800000 and 873723600000 exclusively', (t) => {
  const rrule = new RRule(Frequency.Daily).setCount(10);
  const set = new RRuleSet(873205200000, 'US/Eastern').addRrule(rrule);

  const dates = set.between(873550800000, 873723600000, false);
  const asString = set.toString();

  t.is(
    asString,
    'DTSTART;TZID=US/Eastern:19970902T090000\nFREQ=daily;COUNT=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  t.deepEqual(dates, [873637200000]);
});

test('Daily until September 7, 1997', (t) => {
  const rrule = new RRule(Frequency.Daily).setUntil(873590400000);
  const set = new RRuleSet(873205200000, 'US/Eastern').addRrule(rrule);

  const dates = set.all();
  const asString = set.toString();

  t.is(
    asString,
    'DTSTART;TZID=US/Eastern:19970902T090000\nFREQ=daily;UNTIL=19970907T000000Z;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  t.deepEqual(
    dates,
    [873205200000, 873291600000, 873378000000, 873464400000, 873550800000],
  );
});

test('Every other day', (t) => {
  const rrule = new RRule(Frequency.Daily).setCount(6).setInterval(2);
  const set = new RRuleSet(873205200000, 'US/Eastern').addRrule(rrule);

  const dates = set.all();
  const asString = set.toString();

  t.is(
    asString,
    'DTSTART;TZID=US/Eastern:19970902T090000\nFREQ=daily;COUNT=6;INTERVAL=2;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  t.deepEqual(
    dates,
    [
      873205200000, 873378000000, 873550800000, 873723600000, 873896400000,
      874069200000,
    ],
  );
});

test('Every 10 days, 5 occurrences', (t) => {
  const rrule = new RRule(Frequency.Daily).setCount(5).setInterval(10);
  const set = new RRuleSet(873205200000, 'US/Eastern').addRrule(rrule);

  const dates = set.all();
  const asString = set.toString();

  t.is(
    asString,
    'DTSTART;TZID=US/Eastern:19970902T090000\nFREQ=daily;COUNT=5;INTERVAL=10;BYHOUR=9;BYMINUTE=0;BYSECOND=0',
  );
  t.deepEqual(
    dates,
    [873205200000, 874069200000, 874933200000, 875797200000, 876661200000],
  );
});

test('Every Monday in January, for 3 years', (t) => {
  const rrule = new RRule(Frequency.Daily)
    .setByMonth([Month.January])
    .setByWeekday([Weekday.Monday])
    .setUntil(949327200000);
  const set = new RRuleSet(873205200000, 'US/Eastern').addRrule(rrule);

  const asString = set.toString();
  const dates = set.all();

  t.is(
    asString,
    'DTSTART;TZID=US/Eastern:19970902T090000\nFREQ=daily;UNTIL=20000131T140000Z;BYMONTH=1;BYHOUR=9;BYMINUTE=0;BYSECOND=0;BYDAY=MO',
  );
  t.deepEqual(
    dates,
    [
      884008800000, 884613600000, 885218400000, 885823200000, 915458400000,
      916063200000, 916668000000, 917272800000, 946908000000, 947512800000,
      948117600000, 948722400000, 949327200000,
    ],
  );
});
