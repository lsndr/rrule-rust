import * as b from 'benny';
import * as node from 'rrule';
import * as rust from '../src';

function suite(tzid: string) {
  return [
    b.add('RRuleSet.all() (rust)', () => {
      const rrule = new rust.RRule({
        frequency: rust.Frequency.Daily,
        count: 30,
        interval: 1,
      });
      const set = new rust.RRuleSet({
        dtstart: new rust.DtStart(
          rust.DateTime.local(2023, 2, 21, 23, 59, 0),
          tzid,
        ),
        rrules: [rrule],
      });

      set.all();
    }),
    b.add('...RRuleSet (rust)', () => {
      const rrule = new rust.RRule({
        frequency: rust.Frequency.Daily,
        count: 30,
        interval: 1,
      });
      const set = new rust.RRuleSet({
        dtstart: new rust.DtStart(
          rust.DateTime.local(2023, 2, 21, 23, 59, 0),
          tzid,
        ),
        rrules: [rrule],
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- Required for benchmark
      [...set];
    }),
    b.add('RRule.all() (node)', () => {
      const rrule = new node.RRule({
        freq: node.RRule.DAILY,
        dtstart: new Date(Date.UTC(2023, 2, 21, 23, 59, 0)),
        tzid,
        count: 30,
        interval: 1,
      });

      rrule.all();
    }),
    b.add('RRuleSet.all() (node)', () => {
      const rrule = new node.RRule({
        freq: node.RRule.DAILY,
        dtstart: new Date(Date.UTC(2023, 2, 21, 23, 59, 0)),
        tzid,
        count: 30,
        interval: 1,
      });

      const set = new node.RRuleSet();
      set.rrule(rrule);

      set.all();
    }),
    b.cycle(),
    b.complete(),
  ];
}

Promise.all([
  b.suite('UTC TZ', ...suite('UTC')),
  b.suite('Other TZ', ...suite('Pacific/Kiritimati')),
]).catch(console.error);
