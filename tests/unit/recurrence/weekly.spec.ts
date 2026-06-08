import { RRule, RRuleSet, Frequency, Weekday } from '../../../src';
import { describe, it, expect } from 'vitest';

function fmt(dt: Temporal.ZonedDateTime | Temporal.PlainDate): string {
  if ('hour' in dt) {
    return `${dt.year}-${String(dt.month).padStart(2, '0')}-${String(dt.day).padStart(2, '0')}T${String(dt.hour).padStart(2, '0')}:${String(dt.minute).padStart(2, '0')}:${String(dt.second).padStart(2, '0')}`;
  }
  return `${dt.year}-${String(dt.month).padStart(2, '0')}-${String(dt.day).padStart(2, '0')}`;
}

describe('Weekly', () => {
  it('weekly for 10 occurrences', () => {
    const rrule = new RRule(Frequency.Weekly).setCount(10);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=WEEKLY;COUNT=10',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-09-02T09:00:00',
      '1997-09-09T09:00:00',
      '1997-09-16T09:00:00',
      '1997-09-23T09:00:00',
      '1997-09-30T09:00:00',
      '1997-10-07T09:00:00',
      '1997-10-14T09:00:00',
      '1997-10-21T09:00:00',
      '1997-10-28T09:00:00',
      '1997-11-04T09:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('weekly until December 24, 1997', () => {
    const rrule = new RRule(Frequency.Weekly).setUntil(
      Temporal.ZonedDateTime.from('1997-12-24T00:00:00[America/New_York]'),
    );
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=WEEKLY;UNTIL=19971224T000000',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-09-02T09:00:00',
      '1997-09-09T09:00:00',
      '1997-09-16T09:00:00',
      '1997-09-23T09:00:00',
      '1997-09-30T09:00:00',
      '1997-10-07T09:00:00',
      '1997-10-14T09:00:00',
      '1997-10-21T09:00:00',
      '1997-10-28T09:00:00',
      '1997-11-04T09:00:00',
      '1997-11-11T09:00:00',
      '1997-11-18T09:00:00',
      '1997-11-25T09:00:00',
      '1997-12-02T09:00:00',
      '1997-12-09T09:00:00',
      '1997-12-16T09:00:00',
      '1997-12-23T09:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('every other week - limit 10', () => {
    const rrule = new RRule(Frequency.Weekly)
      .setInterval(2)
      .setWeekstart(Weekday.Sunday);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all(10);

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;WKST=SU',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-09-02T09:00:00',
      '1997-09-16T09:00:00',
      '1997-09-30T09:00:00',
      '1997-10-14T09:00:00',
      '1997-10-28T09:00:00',
      '1997-11-11T09:00:00',
      '1997-11-25T09:00:00',
      '1997-12-09T09:00:00',
      '1997-12-23T09:00:00',
      '1998-01-06T09:00:00',
    ]);
  });

  it('every other week on Monday, Wednesday and Friday until December 24, 1997, but starting on Tuesday, September 2, 1997', () => {
    const rrule = new RRule(Frequency.Weekly)
      .setInterval(2)
      .setUntil(Temporal.ZonedDateTime.from('1997-12-24T00:00:00[America/New_York]'))
      .setWeekstart(Weekday.Sunday)
      .setByWeekday([Weekday.Monday, Weekday.Wednesday, Weekday.Friday]);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000;BYDAY=MO,WE,FR;WKST=SU',
    );
    expect(dates.map(fmt)).toEqual([
      // TODO: rrule crate does not include dtstart date (873205200000), create a bug report
      '1997-09-03T09:00:00',
      '1997-09-05T09:00:00',
      '1997-09-15T09:00:00',
      '1997-09-17T09:00:00',
      '1997-09-19T09:00:00',
      '1997-09-29T09:00:00',
      '1997-10-01T09:00:00',
      '1997-10-03T09:00:00',
      '1997-10-13T09:00:00',
      '1997-10-15T09:00:00',
      '1997-10-17T09:00:00',
      '1997-10-27T09:00:00',
      '1997-10-29T09:00:00',
      '1997-10-31T09:00:00',
      '1997-11-10T09:00:00',
      '1997-11-12T09:00:00',
      '1997-11-14T09:00:00',
      '1997-11-24T09:00:00',
      '1997-11-26T09:00:00',
      '1997-11-28T09:00:00',
      '1997-12-08T09:00:00',
      '1997-12-10T09:00:00',
      '1997-12-12T09:00:00',
      '1997-12-22T09:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('every other week for 4 occurrences when week starts on Monday', () => {
    const rrule = new RRule(Frequency.Weekly)
      .setInterval(2)
      .setCount(4)
      .setByWeekday([Weekday.Tuesday, Weekday.Sunday])
      .setWeekstart(Weekday.Monday);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-08-05T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970805T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=TU,SU;WKST=MO',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-08-05T09:00:00',
      '1997-08-10T09:00:00',
      '1997-08-19T09:00:00',
      '1997-08-24T09:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('every other week for 4 occurrences when week starts on Sunday', () => {
    const rrule = new RRule(Frequency.Weekly)
      .setInterval(2)
      .setCount(4)
      .setByWeekday([Weekday.Tuesday, Weekday.Sunday])
      .setWeekstart(Weekday.Sunday);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-08-05T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970805T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=TU,SU;WKST=SU',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-08-05T09:00:00',
      '1997-08-17T09:00:00',
      '1997-08-19T09:00:00',
      '1997-08-31T09:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });
});
