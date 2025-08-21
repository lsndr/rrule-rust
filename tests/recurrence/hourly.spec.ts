import { RRule, RRuleSet, Frequency, DateTime } from '../../src';

describe('Hourly', () => {
  it('hourly for 5 occurrences', () => {
    const rrule = new RRule(Frequency.Hourly).setCount(5);
    const set = new RRuleSet({
      datetime: DateTime.create(2024, 6, 8, 4, 0, 0, false),
      tzid: 'America/Cancun',
    }).addRrule(rrule);

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=America/Cancun:20240608T040000\nRRULE:FREQ=HOURLY;COUNT=5',
    );
    expect(dates).toEqual([
      DateTime.create(2024, 6, 8, 4, 0, 0, false),
      DateTime.create(2024, 6, 8, 5, 0, 0, false),
      DateTime.create(2024, 6, 8, 6, 0, 0, false),
      DateTime.create(2024, 6, 8, 7, 0, 0, false),
      DateTime.create(2024, 6, 8, 8, 0, 0, false),
    ]);
    expect([...set]).toEqual(dates);
  });

  it('hourly for 6 occurrences by 5 and 8 hour', () => {
    const rrule = new RRule(Frequency.Hourly).setCount(6).setByHour([5, 8]);
    const set = new RRuleSet({
      datetime: DateTime.create(2024, 6, 8, 4, 0, 0, false),
      tzid: 'America/Cancun',
    }).addRrule(rrule);

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=America/Cancun:20240608T040000\nRRULE:FREQ=HOURLY;COUNT=6;BYHOUR=5,8',
    );
    expect(dates).toEqual([
      DateTime.create(2024, 6, 8, 5, 0, 0, false),
      DateTime.create(2024, 6, 8, 8, 0, 0, false),
      DateTime.create(2024, 6, 9, 5, 0, 0, false),
      DateTime.create(2024, 6, 9, 8, 0, 0, false),
      DateTime.create(2024, 6, 10, 5, 0, 0, false),
      DateTime.create(2024, 6, 10, 8, 0, 0, false),
    ]);
    expect([...set]).toEqual(dates);
  });

  it('hourly for 4 occurrences by 9 and 10 second', () => {
    const rrule = new RRule(Frequency.Hourly).setCount(4).setBySecond([9, 10]);
    const set = new RRuleSet({
      datetime: DateTime.create(2024, 6, 8, 4, 0, 0, false),
      tzid: 'America/Cancun',
    }).addRrule(rrule);

    const dates = set.all();
    const asString = set.toString();

    expect(asString).toBe(
      'DTSTART;TZID=America/Cancun:20240608T040000\nRRULE:FREQ=HOURLY;COUNT=4;BYSECOND=9,10',
    );
    expect(dates).toEqual([
      DateTime.create(2024, 6, 8, 4, 0, 9, false),
      DateTime.create(2024, 6, 8, 4, 0, 10, false),
      DateTime.create(2024, 6, 8, 5, 0, 9, false),
      DateTime.create(2024, 6, 8, 5, 0, 10, false),
    ]);
    expect([...set]).toEqual(dates);
  });
});
