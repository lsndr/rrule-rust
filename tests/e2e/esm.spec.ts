import {
  DateTime,
  Frequency,
  Month,
  RRule,
  RRuleSet,
  DtStart,
} from '../../src';
import { Sandbox } from './sandbox/sandbox';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';

describe('ESM', () => {
  const sandbox = new Sandbox({
    esm: true,
  });

  beforeAll(() => {
    sandbox.install();
  });

  afterAll(() => {
    sandbox.uninstall();
  });

  it('yearly in June and July for 10 occurrences', () => {
    const result = sandbox.run(() => {
      const rrule = new RRule({
        frequency: Frequency.Yearly,
        byMonth: [Month.June, Month.July],
        count: 10,
      });
      const set = new RRuleSet(
        new DtStart({
          value: DateTime.create(1997, 6, 10, 9, 0, 0, false),
          tzid: 'US/Eastern',
        }),
      ).addRRule(rrule);

      return {
        asString: set.toString(),
        dates: set.all().map((dt) => dt.toString()),
      };
    });

    expect(result).toEqual({
      asString:
        'DTSTART;TZID=US/Eastern:19970610T090000\nRRULE:FREQ=YEARLY;COUNT=10;BYMONTH=6,7',
      dates: [
        DateTime.create(1997, 6, 10, 9, 0, 0, false),
        DateTime.create(1997, 7, 10, 9, 0, 0, false),
        DateTime.create(1998, 6, 10, 9, 0, 0, false),
        DateTime.create(1998, 7, 10, 9, 0, 0, false),
        DateTime.create(1999, 6, 10, 9, 0, 0, false),
        DateTime.create(1999, 7, 10, 9, 0, 0, false),
        DateTime.create(2000, 6, 10, 9, 0, 0, false),
        DateTime.create(2000, 7, 10, 9, 0, 0, false),
        DateTime.create(2001, 6, 10, 9, 0, 0, false),
        DateTime.create(2001, 7, 10, 9, 0, 0, false),
      ].map((dt) => dt.toString()),
    });
  });
});
