import * as b from 'benny';
import * as Node from 'rrule';
import * as Rust from '../src';

function buildRust(tzid: string) {
  const rrule = new Rust.RRule({
    frequency: Rust.Frequency.Daily,
    count: 30,
    interval: 1,
  });
  const setCached = new Rust.RRuleSet({
    dtstart: new Rust.DtStart(
      Rust.DateTime.local(2023, 2, 21, 23, 59, 0),
      tzid,
    ),
    rrules: [rrule],
  });
  const setNoCache = new Rust.RRuleSet({
    dtstart: new Rust.DtStart(
      Rust.DateTime.local(2023, 2, 21, 23, 59, 0),
      tzid,
    ),
    rrules: [rrule],
  });
  setNoCache.cache.disable();

  return {
    setCached,
    setNoCache,
  };
}

function buildNode(tzid: string) {
  const rruleCached = new Node.RRule({
    freq: Node.RRule.DAILY,
    dtstart: new Date(Date.UTC(2023, 2, 21, 23, 59, 0)),
    tzid,
    count: 30,
    interval: 1,
  });
  const setCached = new Node.RRuleSet();
  setCached.rrule(rruleCached);

  const rruleNoCache = new Node.RRule({
    freq: Node.RRule.DAILY,
    dtstart: new Date(Date.UTC(2023, 2, 21, 23, 59, 0)),
    tzid,
    count: 30,
    interval: 1,
  });
  rruleNoCache._cache = null;
  const setNoCache = new Node.RRuleSet();
  setNoCache._cache = null;
  setNoCache.rrule(rruleNoCache);

  return {
    setCached,
    rruleCached,
    rruleNoCache,
    setNoCache,
  };
}

function suite(tzid: string) {
  const rust = buildRust(tzid);
  const node = buildNode(tzid);

  return [
    b.add('rruleSet.all() (rust)', () => {
      rust.setNoCache.all();
    }),
    b.add('...rruleSet (rust)', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- Required for benchmark
      [...rust.setNoCache];
    }),
    b.add('rruleSet.all() (rust, cache)', () => {
      rust.setCached.all();
    }),
    b.add('...rruleSet (rust, cache)', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- Required for benchmark
      [...rust.setCached];
    }),
    b.add('rrule.all() (node)', () => {
      // reset cache
      node.rruleNoCache.all();
    }),
    b.add('rruleSet.all() (node)', () => {
      node.setNoCache.all();
    }),
    b.add('rrule.all() (node, cache)', () => {
      node.rruleCached.all();
    }),
    b.add('rruleSet.all() (node, cache)', () => {
      node.setCached.all();
    }),
    b.cycle(),
    b.complete(),
  ];
}

Promise.all([
  b.suite('UTC TZ', ...suite('UTC')),
  b.suite('Other TZ', ...suite('Pacific/Kiritimati')),
]).catch(console.error);
