import { RRule, RRuleSet, Frequency, DateTime, DtStart } from '../../src';
import { describe, it, expect } from 'vitest';

describe('Secondly', () => {
  it('Secondly for 5 occurrences', () => {
    const rrule = new RRule(Frequency.Secondly).setCount(5);
    const set = new RRuleSet(
      new DtStart({
        value: DateTime.create(2024, 6, 8, 4, 0, 0, false),
        tzid: 'America/Cancun',
      }),
    ).addRRule(rrule);

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=America/Cancun:20240608T040000\nRRULE:FREQ=SECONDLY;COUNT=5',
    );
    expect(dates).toEqualPlain([
      DateTime.create(2024, 6, 8, 4, 0, 0, false),
      DateTime.create(2024, 6, 8, 4, 0, 1, false),
      DateTime.create(2024, 6, 8, 4, 0, 2, false),
      DateTime.create(2024, 6, 8, 4, 0, 3, false),
      DateTime.create(2024, 6, 8, 4, 0, 4, false),
    ]);
    expect([...set]).toEqualPlain(dates);
  });
});
