import { RRule, RRuleSet, Frequency, DateTime, DtStart } from '../../src';

describe('Minutely', () => {
  it('minutely for 5 occurrences', () => {
    const rrule = new RRule(Frequency.Minutely).setCount(5);
    const set = new RRuleSet(
      new DtStart({
        value: DateTime.create(2024, 6, 8, 4, 0, 0, false),
        tzid: 'America/Cancun',
      }),
    ).addRRule(rrule);

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=America/Cancun:20240608T040000\nRRULE:FREQ=MINUTELY;COUNT=5',
    );
    expect(dates).toEqualPlain([
      DateTime.create(2024, 6, 8, 4, 0, 0, false),
      DateTime.create(2024, 6, 8, 4, 1, 0, false),
      DateTime.create(2024, 6, 8, 4, 2, 0, false),
      DateTime.create(2024, 6, 8, 4, 3, 0, false),
      DateTime.create(2024, 6, 8, 4, 4, 0, false),
    ]);
    expect([...set]).toEqualPlain(dates);
  });
});
