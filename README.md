# rrule-rust

[![npm version](https://badge.fury.io/js/rrule-rust.svg)](https://badge.fury.io/js/rrule-rust)
[![npm downloads/month](https://img.shields.io/npm/dm/rrule-rust.svg)](https://www.npmjs.com/package/rrule-rust)
[![npm downloads](https://img.shields.io/npm/dt/rrule-rust.svg)](https://www.npmjs.com/package/rrule-rust)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/lsndr/rrule-rust/blob/master/LICENSE.md)

`rrule-rust` is a library for working with recurrence rules based on Rust's [rrule](https://crates.io/crates/rrule) crate

1. [Quick Start](#quick-start)
2. [Performance](#performance)

## Quick Start

```
  npm i rrule-rust
```

If you need browser-compatible version with wasm support, install it from `alpha` channel:

```
  npm i rrule-rust@alpha
```

Wasm package is distributed via `alpha` channel because it is based on alpha version of [napi.rs](https://napi.rs/). Once [napi.rs](https://napi.rs/) v3 get released, we will add wasm support to `latest` channel.

See [test folder](https://github.com/lsndr/rrule-rust/tree/master/tests) to find more use cases

```typescript
import { RRule, RRuleSet, Frequency, DateTime } from 'rrule-rust';

const rrule = new RRule({
  frequency: Frequency.Daily,
  count: 5,
});
const set = new RRuleSet({
  dtstart: DateTime.create(1997, 9, 2, 9, 0, 0, false),
  tzid: 'US/Eastern',
  rrules: [rrule],
});

const dates = set.all(); // [ DateTime, DateTime, DateTime, DateTime, DateTime ]
const asString = set.toString(); // DTSTART;TZID=US/Eastern:19970902T090000\nFREQ=daily;COUNT=5;BYHOUR=9;BYMINUTE=0;BYSECOND=0
```

## Performance

```
  Host: MacBook Pro, 14-inch, 2023
  OS: macOS 14.4.1 (23E224)
  Processor: Apple M3 Pro
  Memory: 36 GB LPDDR5
```

|          | rrule        | rrule-rust    |              |
| -------- | ------------ | ------------- | ------------ |
| UTC TZ   | 15 904 ops/s | 108 538 ops/s | ~6x faster   |
| Other TZ | 260 ops/s    | 106 034 ops/s | ~400x faster |

You can run benchmarks using `npm run benchmark`

## License

`rrule-rust` is [MIT licensed](LICENSE.md).
