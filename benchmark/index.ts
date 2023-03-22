import b from 'benny';
import * as node from 'rrule';
import rust from '../';

b.suite(
  'UTC TZ',
  b.add('rrule-rust', () => {
    const rrule = new rust.RRule(rust.Frequency.Daily)
      .setCount(30)
      .setInterval(1);
    const set = new rust.RRuleSet(1679428740000, 'UTC').addRrule(rrule);

    set.all();
  }),
  b.add('rrule', () => {
    const rrule = new node.RRule({
      freq: node.RRule.DAILY,
      dtstart: new Date(Date.UTC(2023, 2, 21, 23, 59, 0)),
      tzid: 'UTC',
      count: 30,
      interval: 1,
    });

    rrule.all();
  }),

  b.cycle(),
  b.complete(),
);

b.suite(
  'Other TZ',
  b.add('rrule-rust', () => {
    const rrule = new rust.RRule(rust.Frequency.Daily)
      .setCount(30)
      .setInterval(1);
    const set = new rust.RRuleSet(1679428740000, 'Pacific/Kiritimati').addRrule(
      rrule,
    );

    set.all();
  }),
  b.add('rrule', () => {
    const rrule = new node.RRule({
      freq: node.RRule.DAILY,
      dtstart: new Date(Date.UTC(2023, 2, 21, 23, 59, 0)),
      tzid: 'Pacific/Kiritimati',
      count: 30,
      interval: 1,
    });

    rrule.all();
  }),

  b.cycle(),
  b.complete(),
);
