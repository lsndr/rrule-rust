import { DateTime, Frequency, RRule, Weekday } from '../../src';
import { describe, it, expect } from 'vitest';

describe(RRule, () => {
  it.each([
    {
      input:
        'FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;WKST=SU;BYDAY=MO,WE,FR',
      expected: {
        frequency: Frequency.Weekly,
        interval: 2,
        until: DateTime.create(1997, 12, 24, 0, 0, 0, true),
        weekstart: Weekday.Sunday,
        byWeekday: [
          { weekday: Weekday.Monday },
          { weekday: Weekday.Wednesday },
          { weekday: Weekday.Friday },
        ],
        asString:
          'RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;BYDAY=MO,WE,FR;WKST=SU',
      },
    },
    {
      input: 'RRULE: FREQ=MONTHLY;INTERVAL=2;COUNT=10;BYDAY=1SU,-1SU',
      expected: {
        frequency: Frequency.Monthly,
        interval: 2,
        count: 10,
        byWeekday: [
          { n: 1, weekday: Weekday.Sunday },
          { n: -1, weekday: Weekday.Sunday },
        ],
        asString: 'RRULE:FREQ=MONTHLY;INTERVAL=2;COUNT=10;BYDAY=1SU,-1SU',
      },
    },
  ])('should properly parse $input', ({ input, expected }) => {
    const rule = RRule.parse(input);

    expect(rule.frequency).toBe(expected.frequency);
    expect(rule.interval).toBe(expected.interval);
    expect(rule.until).toEqualPlain(expected.until);
    expect(rule.weekstart).toBe(expected.weekstart);
    expect(rule.byWeekday).toEqual(expected.byWeekday);
    expect(rule.toString()).toBe(expected.asString);
  });

  it('should throw error on invalid individual recurrence rule', () => {
    const act = () => RRule.parse('Invalid');

    expect(act).toThrowError('Invalid RRULE: Invalid');
  });

  it('should throw error on invalid individual recurrence rule frequency', () => {
    const act = () => RRule.parse('FREQ=Invalid');

    expect(act).toThrow('Invalid FREQ value: Invalid');
  });

  it('should throw error on invalid individual recurrence rule interval', () => {
    const act = () => RRule.parse('FREQ=DAILY;INTERVAL=Invalid');

    expect(act).toThrow('Invalid INTERVAL value: Invalid');
  });

  it('should throw error on invalid individual recurrence rule until', () => {
    const act = () => RRule.parse('FREQ=DAILY;UNTIL=Invalid');

    expect(act).toThrow('Invalid UNTIL value: Invalid');
  });

  it('should throw error on invalid individual recurrence rule week start', () => {
    const act = () => RRule.parse('FREQ=DAILY;WKST=Invalid');

    expect(act).toThrow('Invalid WKST value: Invalid');
  });
});
