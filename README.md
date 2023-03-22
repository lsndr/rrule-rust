# rrule-rust

[![npm version](https://badge.fury.io/js/rrule-rust.svg)](https://badge.fury.io/js/rrule-rust)
[![npm downloads/month](https://img.shields.io/npm/dm/rrule-rust.svg)](https://www.npmjs.com/package/rrule-rust)
[![npm downloads](https://img.shields.io/npm/dt/rrule-rust.svg)](https://www.npmjs.com/package/rrule-rust)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/lsndr/rrule-rust/blob/master/LICENSE.md)


`rrule-rust` is a [napi-rs](https://napi.rs) wrapper around Rust's [rrule](https://crates.io/crates/rrule) crate


1. [Quick Start](#quick-start)
2. [Perfomance](#perfomance)
2. RRule
3. RRuleSet

## Quick Start

See [test folder](https://github.com/lsndr/rrule-rust/tree/master/__test__) to find more use cases

```
  npm install rrule-rust 
```


```typescript
import { RRule, RRuleSet, Frequency } from 'rrule-rust';

const rrule = new RRule(Frequency.Daily).setCount(5);
const set = new RRuleSet(873205200000, 'US/Eastern').addRrule(rrule);

const dates = set.all(); // [ 873205200000, 873291600000, 873378000000, 873464400000, 873550800000 ]
const asString = set.toString(); // DTSTART;TZID=US/Eastern:19970902T090000\nFREQ=daily;COUNT=5;BYHOUR=9;BYMINUTE=0;BYSECOND=0
```

## Perfomance

```
  Host: MacBook Pro, 13-inch, 2018
  OS: macOS 13.2 (22D49)
  Processor: 2,3 GHz Quad-Core Intel Core i5
  Memory: 16 GB 2133 MHz LPDDR3
```

|          | rrule        | rrule-rust   |              |
| -------- | ------------ | ------------ | ------------ |
| UTC TZ   | 8 128 ops/s  | 42 343 ops/s | ~5x faster   |
| Other TZ | 68 ops/s     | 40 549 ops/s | ~600x faster |

You can run benchmarks using `npm run benchmark`

## License

`rrule-rust` is [MIT licensed](LICENSE.md).
