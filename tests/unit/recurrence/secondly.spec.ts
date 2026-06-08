import { RRule, RRuleSet, Frequency } from '../../../src';
import { describe, it, expect } from 'vitest';

function fmt(dt: Temporal.ZonedDateTime | Temporal.PlainDate): string {
  if ('hour' in dt) {
    return `${dt.year}-${String(dt.month).padStart(2, '0')}-${String(dt.day).padStart(2, '0')}T${String(dt.hour).padStart(2, '0')}:${String(dt.minute).padStart(2, '0')}:${String(dt.second).padStart(2, '0')}`;
  }
  return `${dt.year}-${String(dt.month).padStart(2, '0')}-${String(dt.day).padStart(2, '0')}`;
}

describe('Secondly', () => {
  it('Secondly for 5 occurrences', () => {
    const rrule = new RRule(Frequency.Secondly).setCount(5);
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('2024-06-08T04:00:00[America/Cancun]'),
    ).addRRule(rrule);

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=America/Cancun:20240608T040000\nRRULE:FREQ=SECONDLY;COUNT=5',
    );
    expect(dates.map(fmt)).toEqual([
      '2024-06-08T04:00:00',
      '2024-06-08T04:00:01',
      '2024-06-08T04:00:02',
      '2024-06-08T04:00:03',
      '2024-06-08T04:00:04',
    ]);
    expect([...set].map(fmt)).toEqual(dates.map(fmt));
  });
});
