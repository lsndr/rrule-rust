import { RRule, RRuleSet, Frequency, Month, Weekday } from '../../../src';
import { describe, it, expect } from 'vitest';

function fmt(dt: Temporal.ZonedDateTime | Temporal.PlainDate): string {
  if ('hour' in dt) {
    return `${dt.year}-${String(dt.month).padStart(2, '0')}-${String(dt.day).padStart(2, '0')}T${String(dt.hour).padStart(2, '0')}:${String(dt.minute).padStart(2, '0')}:${String(dt.second).padStart(2, '0')}`;
  }
  return `${dt.year}-${String(dt.month).padStart(2, '0')}-${String(dt.day).padStart(2, '0')}`;
}

describe('Daily', () => {
  it('daily for 10 occurrences (date-only)', () => {
    const set = new RRuleSet(Temporal.PlainDate.from('1997-09-02')).addRRule(
      new RRule(Frequency.Daily).setCount(10),
    );

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe('DTSTART:19970902\nRRULE:FREQ=DAILY;COUNT=10');
    expect(dates.map(fmt)).toEqual([
      '1997-09-02',
      '1997-09-03',
      '1997-09-04',
      '1997-09-05',
      '1997-09-06',
      '1997-09-07',
      '1997-09-08',
      '1997-09-09',
      '1997-09-10',
      '1997-09-11',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('daily for 10 occurrences', () => {
    const rrule = new RRule(Frequency.Daily).setCount(10);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=DAILY;COUNT=10',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-09-02T09:00:00',
      '1997-09-03T09:00:00',
      '1997-09-04T09:00:00',
      '1997-09-05T09:00:00',
      '1997-09-06T09:00:00',
      '1997-09-07T09:00:00',
      '1997-09-08T09:00:00',
      '1997-09-09T09:00:00',
      '1997-09-10T09:00:00',
      '1997-09-11T09:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('daily for 10 occurrences between 873550800000 and 873723600000 inclusively', () => {
    const rrule = new RRule(Frequency.Daily).setCount(10);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const dates = set.between(
      Temporal.ZonedDateTime.from('1997-09-06T09:00:00[America/New_York]'),
      Temporal.ZonedDateTime.from('1997-09-08T09:00:00[America/New_York]'),
      true,
    );
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=DAILY;COUNT=10',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-09-06T09:00:00',
      '1997-09-07T09:00:00',
      '1997-09-08T09:00:00',
    ]);
  });

  it('daily for 10 occurrences between 873550800000 and 873723600000 exclusively', () => {
    const rrule = new RRule(Frequency.Daily).setCount(10);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const dates = set.between(
      Temporal.ZonedDateTime.from('1997-09-06T09:00:00[America/New_York]'),
      Temporal.ZonedDateTime.from('1997-09-08T09:00:00[America/New_York]'),
      false,
    );
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=DAILY;COUNT=10',
    );
    expect(dates.map(fmt)).toEqual(['1997-09-07T09:00:00']);
    expect(new Date(dates[0]!.toInstant().epochMilliseconds)).toEqual(
      new Date(Date.UTC(1997, 8, 7, 13, 0, 0)),
    );
  });

  it('daily until September 6, 1997', () => {
    const rrule = new RRule(Frequency.Daily).setUntil(
      Temporal.ZonedDateTime.from('1997-09-06T09:00:00[America/New_York]'),
    );
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=DAILY;UNTIL=19970906T090000',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-09-02T09:00:00',
      '1997-09-03T09:00:00',
      '1997-09-04T09:00:00',
      '1997-09-05T09:00:00',
      '1997-09-06T09:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('every other day', () => {
    const rrule = new RRule(Frequency.Daily).setCount(6).setInterval(2);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=DAILY;INTERVAL=2;COUNT=6',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-09-02T09:00:00',
      '1997-09-04T09:00:00',
      '1997-09-06T09:00:00',
      '1997-09-08T09:00:00',
      '1997-09-10T09:00:00',
      '1997-09-12T09:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('every 10 days, 5 occurrences', () => {
    const rrule = new RRule(Frequency.Daily).setCount(5).setInterval(10);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=DAILY;INTERVAL=10;COUNT=5',
    );
    expect(dates.map(fmt)).toEqual([
      '1997-09-02T09:00:00',
      '1997-09-12T09:00:00',
      '1997-09-22T09:00:00',
      '1997-10-02T09:00:00',
      '1997-10-12T09:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('every Monday in January, for 3 years', () => {
    const rrule = new RRule(Frequency.Daily)
      .setByMonth([Month.January])
      .setByWeekday([Weekday.Monday])
      .setUntil(Temporal.ZonedDateTime.from('2000-01-31T14:00:00[America/New_York]'));
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).addRRule(rrule);

    const asString = set.toString();
    const dates = set.all();

    expect(asString).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=DAILY;UNTIL=20000131T140000;BYMONTH=1;BYDAY=MO',
    );
    expect(dates.map(fmt)).toEqual([
      '1998-01-05T09:00:00',
      '1998-01-12T09:00:00',
      '1998-01-19T09:00:00',
      '1998-01-26T09:00:00',
      '1999-01-04T09:00:00',
      '1999-01-11T09:00:00',
      '1999-01-18T09:00:00',
      '1999-01-25T09:00:00',
      '2000-01-03T09:00:00',
      '2000-01-10T09:00:00',
      '2000-01-17T09:00:00',
      '2000-01-24T09:00:00',
      '2000-01-31T09:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('every Monday in January, for 3 years except Jan 31 2000', () => {
    const rrule = new RRule(Frequency.Daily)
      .setByMonth([Month.January])
      .setByWeekday([Weekday.Monday])
      .setUntil(Temporal.ZonedDateTime.from('2000-01-31T14:00:00[America/New_York]'));

    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[Asia/Tbilisi]'),
    )
      .addRRule(rrule)
      .addExDates([
        Temporal.ZonedDateTime.from('2000-01-31T09:00:00[Asia/Tbilisi]'),
      ]);

    const dates = set.all();

    expect(dates.map(fmt)).toEqual([
      '1998-01-05T09:00:00',
      '1998-01-12T09:00:00',
      '1998-01-19T09:00:00',
      '1998-01-26T09:00:00',
      '1999-01-04T09:00:00',
      '1999-01-11T09:00:00',
      '1999-01-18T09:00:00',
      '1999-01-25T09:00:00',
      '2000-01-03T09:00:00',
      '2000-01-10T09:00:00',
      '2000-01-17T09:00:00',
      '2000-01-24T09:00:00',
    ]);
    expect(set.rrules.map((rrule) => rrule.toString())).toEqual([
      'RRULE:FREQ=DAILY;UNTIL=20000131T140000;BYMONTH=1;BYDAY=MO',
    ]);
    expect(set.exrules).toEqual([]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  describe('folds and gaps', () => {
    it('daily for 10 occurrences across ST => DST', () => {
      const rrule = new RRule(Frequency.Daily).setCount(10);

      const set = new RRuleSet(
        Temporal.ZonedDateTime.from('2025-03-08T02:00:00[America/Los_Angeles]', {
          disambiguation: 'compatible',
        }),
      ).addRRule(rrule);

      expect(set.toString()).toBe(
        'DTSTART;TZID=America/Los_Angeles:20250308T020000\nRRULE:FREQ=DAILY;COUNT=10',
      );

      const all = set.all();
      expect(all.map(fmt)).toEqual([
        '2025-03-08T02:00:00',
        '2025-03-09T03:00:00',
        '2025-03-10T02:00:00',
        '2025-03-11T02:00:00',
        '2025-03-12T02:00:00',
        '2025-03-13T02:00:00',
        '2025-03-14T02:00:00',
        '2025-03-15T02:00:00',
        '2025-03-16T02:00:00',
        '2025-03-17T02:00:00',
      ]);

      const between = set.between(
        Temporal.ZonedDateTime.from('2025-03-09T02:00:00[America/Los_Angeles]', {
          disambiguation: 'compatible',
        }),
        Temporal.ZonedDateTime.from('2025-03-11T02:00:00[America/Los_Angeles]'),
        true,
      );
      expect(between.map(fmt)).toEqual([
        '2025-03-09T03:00:00',
        '2025-03-10T02:00:00',
        '2025-03-11T02:00:00',
      ]);
    });

    it('daily for 10 occurrences across DST => ST', () => {
      const rrule = new RRule(Frequency.Daily).setCount(10);

      const set = new RRuleSet(
        Temporal.ZonedDateTime.from('2025-11-01T01:00:00[America/Los_Angeles]', {
          disambiguation: 'compatible',
        }),
      ).addRRule(rrule);

      expect(set.toString()).toBe(
        'DTSTART;TZID=America/Los_Angeles:20251101T010000\nRRULE:FREQ=DAILY;COUNT=10',
      );

      const all = set.all();
      expect(all.map(fmt)).toEqual([
        '2025-11-01T01:00:00',
        '2025-11-02T01:00:00',
        '2025-11-03T01:00:00',
        '2025-11-04T01:00:00',
        '2025-11-05T01:00:00',
        '2025-11-06T01:00:00',
        '2025-11-07T01:00:00',
        '2025-11-08T01:00:00',
        '2025-11-09T01:00:00',
        '2025-11-10T01:00:00',
      ]);

      const between = set.between(
        Temporal.ZonedDateTime.from('2025-11-02T01:00:00[America/Los_Angeles]', {
          disambiguation: 'compatible',
        }),
        Temporal.ZonedDateTime.from('2025-11-04T01:00:00[America/Los_Angeles]', {
          disambiguation: 'compatible',
        }),
        true,
      );
      expect(between.map(fmt)).toEqual([
        '2025-11-02T01:00:00',
        '2025-11-03T01:00:00',
        '2025-11-04T01:00:00',
      ]);
    });
  });
});
