import { Frequency, Month, RRule, RRuleSet } from '../../src';
import { Sandbox } from './../.config/sandbox';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';

describe('Commonjs', () => {
  const sandbox = new Sandbox();

  beforeAll(() => {
    sandbox.install();
  });

  afterAll(() => {
    sandbox.uninstall();
  });

  describe.each([undefined, 'error'])(
    'NAPI_RS_FORCE_WASI=%s',
    (NAPI_RS_FORCE_WASI) => {
      it('yearly in June and July for 10 occurrences', () => {
        const result = sandbox.run(
          () => {
            const rrule = new RRule({
              frequency: Frequency.Yearly,
              byMonth: [Month.June, Month.July],
              count: 10,
            });
            const set = new RRuleSet(
              Temporal.ZonedDateTime.from('1997-06-10T09:00:00[America/New_York]'),
            ).addRRule(rrule);

            return {
              asString: set.toString(),
              dates: set.all().map((dt) => dt.toString()),
            };
          },
          {
            env: { NAPI_RS_FORCE_WASI },
          },
        );

        expect(result).toEqual({
          asString:
            'DTSTART;TZID=America/New_York:19970610T090000\nRRULE:FREQ=YEARLY;COUNT=10;BYMONTH=6,7',
          dates: [
            '1997-06-10T09:00:00-04:00[America/New_York]',
            '1997-07-10T09:00:00-04:00[America/New_York]',
            '1998-06-10T09:00:00-04:00[America/New_York]',
            '1998-07-10T09:00:00-04:00[America/New_York]',
            '1999-06-10T09:00:00-04:00[America/New_York]',
            '1999-07-10T09:00:00-04:00[America/New_York]',
            '2000-06-10T09:00:00-04:00[America/New_York]',
            '2000-07-10T09:00:00-04:00[America/New_York]',
            '2001-06-10T09:00:00-04:00[America/New_York]',
            '2001-07-10T09:00:00-04:00[America/New_York]',
          ],
        });
      });
    },
  );
});
