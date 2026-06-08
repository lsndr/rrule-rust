import { RRule, RRuleSet, Frequency, Weekday } from '../../../src';
import { describe, it, expect } from 'vitest';

function fmt(dt: Temporal.ZonedDateTime | Temporal.PlainDate): string {
  if ('hour' in dt) {
    return `${dt.year}-${String(dt.month).padStart(2, '0')}-${String(dt.day).padStart(2, '0')}T${String(dt.hour).padStart(2, '0')}:${String(dt.minute).padStart(2, '0')}:${String(dt.second).padStart(2, '0')}`;
  }
  return `${dt.year}-${String(dt.month).padStart(2, '0')}-${String(dt.day).padStart(2, '0')}`;
}

describe('Monthly', () => {
  it('monthly on the 1st Friday for 10 occurrences', () => {
    const rrule = new RRule(Frequency.Monthly)
      .setCount(10)
      .setByWeekday([Weekday.Friday])
      .setBySetpos([1]);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=10;BYSETPOS=1;BYDAY=FR',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-09-05T09:00:00',
      '1997-10-03T09:00:00',
      '1997-11-07T09:00:00',
      '1997-12-05T09:00:00',
      '1998-01-02T09:00:00',
      '1998-02-06T09:00:00',
      '1998-03-06T09:00:00',
      '1998-04-03T09:00:00',
      '1998-05-01T09:00:00',
      '1998-06-05T09:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('monthly on the 1st Friday until December 24, 1997', () => {
    const rrule = new RRule(Frequency.Monthly)
      .setUntil(Temporal.ZonedDateTime.from('1997-12-24T00:00:00[America/New_York]'))
      .setByWeekday([Weekday.Friday])
      .setBySetpos([1]);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=MONTHLY;UNTIL=19971224T000000;BYSETPOS=1;BYDAY=FR',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-09-05T09:00:00',
      '1997-10-03T09:00:00',
      '1997-11-07T09:00:00',
      '1997-12-05T09:00:00',
    ]);
    expect(new Date(dates[0]!.toInstant().epochMilliseconds)).toEqual(
      new Date(Date.UTC(1997, 8, 5, 13, 0, 0, 0)),
    );
    expect(new Date(dates[1]!.toInstant().epochMilliseconds)).toEqual(
      new Date(Date.UTC(1997, 9, 3, 13, 0, 0, 0)),
    );
    expect(new Date(dates[2]!.toInstant().epochMilliseconds)).toEqual(
      new Date(Date.UTC(1997, 10, 7, 14, 0, 0, 0)),
    );
    expect(new Date(dates[3]!.toInstant().epochMilliseconds)).toEqual(
      new Date(Date.UTC(1997, 11, 5, 14, 0, 0, 0)),
    );
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('every other month on the 1st and last Sunday of the month for 10 occurrences', () => {
    const rrule = new RRule(Frequency.Monthly)
      .setInterval(2)
      .setCount(10)
      .setByWeekday([Weekday.Sunday, Weekday.Sunday])
      .setBySetpos([1, -1]);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=MONTHLY;INTERVAL=2;COUNT=10;BYSETPOS=1,-1;BYDAY=SU,SU',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-09-07T09:00:00',
      '1997-09-28T09:00:00',
      '1997-11-02T09:00:00',
      '1997-11-30T09:00:00',
      '1998-01-04T09:00:00',
      '1998-01-25T09:00:00',
      '1998-03-01T09:00:00',
      '1998-03-29T09:00:00',
      '1998-05-03T09:00:00',
      '1998-05-31T09:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('every friday the 13th for 5 occurrences', () => {
    const rrule = new RRule(Frequency.Monthly)
      .setCount(5)
      .setByWeekday([Weekday.Friday])
      .setByMonthday([13]);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    )
      .addRRule(rrule)
      .addExDate(
        Temporal.ZonedDateTime.from('1998-11-13T09:00:00[America/New_York]'),
      );

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=5;BYMONTHDAY=13;BYDAY=FR\nEXDATE;TZID=America/New_York:19981113T090000',
    );
    expect(dates.map(fmt)).toEqual([
      '1998-02-13T09:00:00',
      '1998-03-13T09:00:00',
      '1999-08-13T09:00:00',
      '2000-10-13T09:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('the second-to-last weekday of the month', () => {
    const rrule = new RRule(Frequency.Monthly)
      .setCount(7)
      .setByWeekday([
        Weekday.Monday,
        Weekday.Tuesday,
        Weekday.Wednesday,
        Weekday.Thursday,
        Weekday.Friday,
      ])
      .setBySetpos([-2]);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-29T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970929T090000\nRRULE:FREQ=MONTHLY;COUNT=7;BYSETPOS=-2;BYDAY=MO,TU,WE,TH,FR',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-09-29T09:00:00',
      '1997-10-30T09:00:00',
      '1997-11-27T09:00:00',
      '1997-12-30T09:00:00',
      '1998-01-29T09:00:00',
      '1998-02-26T09:00:00',
      '1998-03-30T09:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('monthly on the second to last Monday of the month for 6 months', () => {
    const rrule = new RRule(Frequency.Monthly)
      .setCount(6)
      .setByWeekday([Weekday.Monday])
      .setBySetpos([-2]);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=6;BYSETPOS=-2;BYDAY=MO',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-09-22T09:00:00',
      '1997-10-20T09:00:00',
      '1997-11-17T09:00:00',
      '1997-12-22T09:00:00',
      '1998-01-19T09:00:00',
      '1998-02-16T09:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('monthly on the third to the last day of the month, limit 6', () => {
    const rrule = new RRule(Frequency.Monthly).setByMonthday([-3]);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all(6);

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=MONTHLY;BYMONTHDAY=-3',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-09-28T09:00:00',
      '1997-10-29T09:00:00',
      '1997-11-28T09:00:00',
      '1997-12-29T09:00:00',
      '1998-01-29T09:00:00',
      '1998-02-26T09:00:00',
    ]);
  });

  it('monthly on the 2nd and 15th of the month for 10 occurrences', () => {
    const rrule = new RRule(Frequency.Monthly)
      .setCount(10)
      .setByMonthday([2, 15]);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=10;BYMONTHDAY=2,15',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-09-02T09:00:00',
      '1997-09-15T09:00:00',
      '1997-10-02T09:00:00',
      '1997-10-15T09:00:00',
      '1997-11-02T09:00:00',
      '1997-11-15T09:00:00',
      '1997-12-02T09:00:00',
      '1997-12-15T09:00:00',
      '1998-01-02T09:00:00',
      '1998-01-15T09:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('monthly on the first and last day of the month for 10 occurrences', () => {
    const rrule = new RRule(Frequency.Monthly)
      .setCount(10)
      .setByMonthday([1, -1]);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=MONTHLY;COUNT=10;BYMONTHDAY=1,-1',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-09-30T09:00:00',
      '1997-10-01T09:00:00',
      '1997-10-31T09:00:00',
      '1997-11-01T09:00:00',
      '1997-11-30T09:00:00',
      '1997-12-01T09:00:00',
      '1997-12-31T09:00:00',
      '1998-01-01T09:00:00',
      '1998-01-31T09:00:00',
      '1998-02-01T09:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('every 18 months on the 10th thru 15th of the month for 10 occurrences', () => {
    const rrule = new RRule(Frequency.Monthly)
      .setCount(10)
      .setInterval(18)
      .setByMonthday([10, 11, 12, 13, 14, 15]);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=MONTHLY;INTERVAL=18;COUNT=10;BYMONTHDAY=10,11,12,13,14,15',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-09-10T09:00:00',
      '1997-09-11T09:00:00',
      '1997-09-12T09:00:00',
      '1997-09-13T09:00:00',
      '1997-09-14T09:00:00',
      '1997-09-15T09:00:00',
      '1999-03-10T09:00:00',
      '1999-03-11T09:00:00',
      '1999-03-12T09:00:00',
      '1999-03-13T09:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('monthly 5 times with two rdates and one exdate', () => {
    const rrule = new RRule(Frequency.Monthly).setCount(5);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('2012-02-01T02:30:00[UTC]'),
    )
      .addRRule(rrule)
      .addRDate(Temporal.ZonedDateTime.from('2012-07-01T02:30:00[UTC]'))
      .addRDate(Temporal.ZonedDateTime.from('2012-07-02T02:30:00[UTC]'))
      .addExDate(Temporal.ZonedDateTime.from('2012-06-01T02:30:00[UTC]'));

    const dates = set.all();

    expect(set.rdates.map((d) => d.toString())).toEqual([
      '2012-07-01T02:30:00+00:00[UTC]',
      '2012-07-02T02:30:00+00:00[UTC]',
    ]);
    expect(set.exdates.map((d) => d.toString())).toEqual([
      '2012-06-01T02:30:00+00:00[UTC]',
    ]);
    expect(dates.map(fmt)).toEqual([
      '2012-02-01T02:30:00',
      '2012-03-01T02:30:00',
      '2012-04-01T02:30:00',
      '2012-05-01T02:30:00',
      '2012-07-01T02:30:00',
      '2012-07-02T02:30:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('every Tuesday, every other month, limit 18', () => {
    const rrule = new RRule(Frequency.Monthly)
      .setInterval(2)
      .setByWeekday([Weekday.Tuesday]);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all(18);

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=MONTHLY;INTERVAL=2;BYDAY=TU',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-09-02T09:00:00',
      '1997-09-09T09:00:00',
      '1997-09-16T09:00:00',
      '1997-09-23T09:00:00',
      '1997-09-30T09:00:00',
      '1997-11-04T09:00:00',
      '1997-11-11T09:00:00',
      '1997-11-18T09:00:00',
      '1997-11-25T09:00:00',
      '1998-01-06T09:00:00',
      '1998-01-13T09:00:00',
      '1998-01-20T09:00:00',
      '1998-01-27T09:00:00',
      '1998-03-03T09:00:00',
      '1998-03-10T09:00:00',
      '1998-03-17T09:00:00',
      '1998-03-24T09:00:00',
      '1998-03-31T09:00:00',
    ]);
  });

  it('monthly on the second to last Monday of the month for 6 months 1', () => {
    const rrule = new RRule(Frequency.Monthly)
      .setByWeekday([{ weekday: Weekday.Monday, n: -2 }])
      .setCount(6);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-22T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all(8);

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970922T090000\nRRULE:FREQ=MONTHLY;COUNT=6;BYDAY=-2MO',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-09-22T09:00:00',
      '1997-10-20T09:00:00',
      '1997-11-17T09:00:00',
      '1997-12-22T09:00:00',
      '1998-01-19T09:00:00',
      '1998-02-16T09:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('errors on invalid by-weekday', () => {
    expect(() =>
      new RRule(Frequency.Monthly).setByWeekday(['invalid' as any]).toString(),
    ).toThrow('Value is none of these types `NWeekday`, `Weekday`');
  });
});
