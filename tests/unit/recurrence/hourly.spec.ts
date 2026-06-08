import { RRule, RRuleSet, Frequency } from '../../../src';
import { describe, it, expect } from 'vitest';

function fmt(dt: Temporal.ZonedDateTime | Temporal.PlainDate): string {
  if ('hour' in dt) {
    return `${dt.year}-${String(dt.month).padStart(2, '0')}-${String(dt.day).padStart(2, '0')}T${String(dt.hour).padStart(2, '0')}:${String(dt.minute).padStart(2, '0')}:${String(dt.second).padStart(2, '0')}`;
  }
  return `${dt.year}-${String(dt.month).padStart(2, '0')}-${String(dt.day).padStart(2, '0')}`;
}

describe('Hourly', () => {
  it('hourly for 5 occurrences', () => {
    const rrule = new RRule(Frequency.Hourly).setCount(5);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('2024-06-08T04:00:00[America/Cancun]'),
    ).addRRule(rrule);

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=America/Cancun:20240608T040000\nRRULE:FREQ=HOURLY;COUNT=5',
    );
    expect(dates.map(fmt)).toEqual([
      '2024-06-08T04:00:00',
      '2024-06-08T05:00:00',
      '2024-06-08T06:00:00',
      '2024-06-08T07:00:00',
      '2024-06-08T08:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('hourly for 6 occurrences by 5 and 8 hour', () => {
    const rrule = new RRule(Frequency.Hourly).setCount(6).setByHour([5, 8]);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('2024-06-08T04:00:00[America/Cancun]'),
    ).addRRule(rrule);

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=America/Cancun:20240608T040000\nRRULE:FREQ=HOURLY;COUNT=6;BYHOUR=5,8',
    );
    expect(dates.map(fmt)).toEqual([
      '2024-06-08T05:00:00',
      '2024-06-08T08:00:00',
      '2024-06-09T05:00:00',
      '2024-06-09T08:00:00',
      '2024-06-10T05:00:00',
      '2024-06-10T08:00:00',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });

  it('hourly for 4 occurrences by 9 and 10 second', () => {
    const rrule = new RRule(Frequency.Hourly).setCount(4).setBySecond([9, 10]);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('2024-06-08T04:00:00[America/Cancun]'),
    ).addRRule(rrule);

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=America/Cancun:20240608T040000\nRRULE:FREQ=HOURLY;COUNT=4;BYSECOND=9,10',
    );
    expect(dates.map(fmt)).toEqual([
      '2024-06-08T04:00:09',
      '2024-06-08T04:00:10',
      '2024-06-08T05:00:09',
      '2024-06-08T05:00:10',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });
});
