import * as b from 'benny';
import * as Node from 'rrule';
import * as Rust from '../src';

function buildRust(tzid: string) {
  const rrule = new Rust.RRule({
    frequency: Rust.Frequency.Daily,
    count: 30,
    interval: 1,
  });
  const set = new Rust.RRuleSet({
    dtstart: new Rust.DtStart(
      Rust.DateTime.local(2023, 2, 21, 23, 59, 0),
      tzid,
    ),
    rrules: [rrule],
  });

  return {
    set,
  };
}

function buildNode(tzid: string) {
  const rrule = new Node.RRule({
    freq: Node.RRule.DAILY,
    dtstart: new Date(Date.UTC(2023, 2, 21, 23, 59, 0)),
    tzid,
    count: 30,
    interval: 1,
  });
  const set = new Node.RRuleSet();
  set.rrule(rrule);

  return {
    set,
    rrule,
  };
}

function suite(tzid: string) {
  const rust = buildRust(tzid);
  const node = buildNode(tzid);

  return [
    b.add('rruleSet.all() (rust)', () => {
      rust.set.all();
    }),
    b.add('...rruleSet (rust)', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- Required for benchmark
      [...rust.set];
    }),
    b.add('rrule.all() (node)', () => {
      // reset cache
      node.rrule._cache = null;
      node.rrule.all();
    }),
    b.add('rruleSet.all() (node)', () => {
      // reset cache
      node.set._cache = null;
      node.set.all();
    }),
    b.cycle(),
    b.complete(),
  ];
}

Promise.all([
  b.suite('UTC TZ', ...suite('UTC')),
  b.suite('Other TZ', ...suite('Pacific/Kiritimati')),
]).catch(console.error);
