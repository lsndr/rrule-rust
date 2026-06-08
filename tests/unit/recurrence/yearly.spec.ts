import { RRule, RRuleSet, Frequency, Month, Weekday } from '../../../src';
import { describe, it, expect } from 'vitest';

function fmt(dt: Temporal.ZonedDateTime | Temporal.PlainDate): string {
  if ('hour' in dt) {
    return `${dt.year}-${String(dt.month).padStart(2, '0')}-${String(dt.day).padStart(2, '0')}T${String(dt.hour).padStart(2, '0')}:${String(dt.minute).padStart(2, '0')}:${String(dt.second).padStart(2, '0')}`;
  }
  return `${dt.year}-${String(dt.month).padStart(2, '0')}-${String(dt.day).padStart(2, '0')}`;
}

describe('Yearly', () => {
  it('yearly in June and July for 10 occurrences', () => {
    const rrule = new RRule(Frequency.Yearly)
      .setCount(10)
      .setByMonth([Month.June, Month.July]);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-06-10T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970610T090000\nRRULE:FREQ=YEARLY;COUNT=10;BYMONTH=6,7',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-06-10T09:00:00',
      '1997-07-10T09:00:00',
      '1998-06-10T09:00:00',
      '1998-07-10T09:00:00',
      '1999-06-10T09:00:00',
      '1999-07-10T09:00:00',
      '2000-06-10T09:00:00',
      '2000-07-10T09:00:00',
      '2001-06-10T09:00:00',
      '2001-07-10T09:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('every other year on January, February, and March for 10 occurrences', () => {
    const rrule = new RRule(Frequency.Yearly)
      .setInterval(2)
      .setCount(10)
      .setByMonth([Month.January, Month.February, Month.March]);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-03-10T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970310T090000\nRRULE:FREQ=YEARLY;INTERVAL=2;COUNT=10;BYMONTH=1,2,3',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-03-10T09:00:00',
      '1999-01-10T09:00:00',
      '1999-02-10T09:00:00',
      '1999-03-10T09:00:00',
      '2001-01-10T09:00:00',
      '2001-02-10T09:00:00',
      '2001-03-10T09:00:00',
      '2003-01-10T09:00:00',
      '2003-02-10T09:00:00',
      '2003-03-10T09:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('every 3rd year on the 1st, 100th and 200th day for 10 occurrences', () => {
    const rrule = new RRule(Frequency.Yearly)
      .setCount(10)
      .setInterval(3)
      .setByYearday([1, 100, 200]);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-01-01T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970101T090000\nRRULE:FREQ=YEARLY;INTERVAL=3;COUNT=10;BYYEARDAY=1,100,200',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-01-01T09:00:00',
      '1997-04-10T09:00:00',
      '1997-07-19T09:00:00',
      '2000-01-01T09:00:00',
      '2000-04-09T09:00:00',
      '2000-07-18T09:00:00',
      '2003-01-01T09:00:00',
      '2003-04-10T09:00:00',
      '2003-07-19T09:00:00',
      '2006-01-01T09:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('every 20th Monday of the year, limit 3', () => {
    const rrule = new RRule(Frequency.Yearly)
      .setByWeekday([Weekday.Monday])
      .setBySetpos([20]);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-05-12T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all(3);

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970512T090000\nRRULE:FREQ=YEARLY;BYSETPOS=20;BYDAY=MO',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-05-19T09:00:00',
      '1998-05-18T09:00:00',
      '1999-05-17T09:00:00',
    ]);
  });

  it('monday of week number 20 (where the default start of the week is Monday), limit 3', () => {
    const rrule = new RRule(Frequency.Yearly)
      .setWeekstart(Weekday.Monday)
      .setByWeekday([Weekday.Monday])
      .setByWeekno([20]);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-05-12T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all(3);

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970512T090000\nRRULE:FREQ=YEARLY;BYWEEKNO=20;BYDAY=MO;WKST=MO',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-05-12T09:00:00',
      '1998-05-11T09:00:00',
      '1999-05-17T09:00:00',
    ]);
  });

  it('every Thursday in March, limit 11', () => {
    const rrule = new RRule(Frequency.Yearly)
      .setByMonth([Month.March])
      .setByWeekday([Weekday.Thursday]);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-03-13T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all(11);

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970313T090000\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=TH',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-03-13T09:00:00',
      '1997-03-20T09:00:00',
      '1997-03-27T09:00:00',
      '1998-03-05T09:00:00',
      '1998-03-12T09:00:00',
      '1998-03-19T09:00:00',
      '1998-03-26T09:00:00',
      '1999-03-04T09:00:00',
      '1999-03-11T09:00:00',
      '1999-03-18T09:00:00',
      '1999-03-25T09:00:00',
    ]);
  });

  it('every Friday the 13th, limit 5', () => {
    const rrule = new RRule(Frequency.Yearly)
      .setByWeekday([Weekday.Friday])
      .setByMonthday([13]);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    )
      .addExDate(Temporal.ZonedDateTime.from('1998-03-13T09:00:00[America/New_York]'))
      .addRRule(rrule);

    const asString = set.toString();
    const dates = set.all(5);

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\n' +
        'RRULE:FREQ=YEARLY;BYMONTHDAY=13;BYDAY=FR\n' +
        'EXDATE;TZID=America/New_York:19980313T090000',
    );
    expect(dates.map(fmt)).toEqual([
      '1998-02-13T09:00:00',
      '1998-11-13T09:00:00',
      '1999-08-13T09:00:00',
      '2000-10-13T09:00:00',
      '2001-04-13T09:00:00',
    ]);
  });

  it('every four years, the first Tuesday after a Monday in November, forever (U.S. Presidential Election day)', () => {
    const rrule = new RRule(Frequency.Yearly)
      .setInterval(4)
      .setByMonth([Month.November])
      .setByWeekday([Weekday.Tuesday])
      .setByMonthday([2, 3, 4, 5, 6, 7, 8]);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1996-11-05T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all(3);

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19961105T090000\nRRULE:FREQ=YEARLY;INTERVAL=4;BYMONTHDAY=2,3,4,5,6,7,8;BYMONTH=11;BYDAY=TU',
    );
    expect(dates.map(fmt)).toEqual([
      '1996-11-05T09:00:00',
      '2000-11-07T09:00:00',
      '2004-11-02T09:00:00',
    ]);
  });
});
