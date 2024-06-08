import { DateTime, Frequency, Month, RRule, RRuleSet } from '../src';
import { Sandbox } from './sandbox/sandbox';

describe('Yearly', () => {
  const sandbox = new Sandbox();

  beforeAll(() => {
    const version = process.env['E2E_LIBRARY_VERSION'];

    if (!version) {
      throw new Error('E2E_LIBRARY_VERSION is required');
    }

    sandbox.install(version);
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
        DateTime.create(1997, 6, 10, 9, 0, 0, false),
        'US/Eastern',
      ).addRrule(rrule);

      return {
        asString: set.toString(),
        dates: set.all(),
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
      ],
    });
  });
});
