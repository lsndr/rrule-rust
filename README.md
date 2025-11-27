# rrule-rust

[![npm version](https://badge.fury.io/js/rrule-rust.svg)](https://badge.fury.io/js/rrule-rust)
[![npm downloads/month](https://img.shields.io/npm/dm/rrule-rust.svg)](https://www.npmjs.com/package/rrule-rust)
[![npm downloads](https://img.shields.io/npm/dt/rrule-rust.svg)](https://www.npmjs.com/package/rrule-rust)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/lsndr/rrule-rust/blob/master/LICENSE.md)

`rrule-rust` is a library for handling recurrence rules, powered by Rust's high-performance [rrule](https://crates.io/crates/rrule) crate.

> 🚀 It provides significant performance improvements over pure JavaScript implementation, especially when working with non-UTC timezones.

1. [Quick Start](#quick-start)
2. [Performance](#performance)

## Quick Start

Install the package using npm:

```
npm i rrule-rust
```

For more usage examples and advanced scenarios, see the [tests directory](https://github.com/lsndr/rrule-rust/tree/master/tests) in the repository.

```typescript
import { RRule, RRuleSet, Frequency, DateTime, DtStart } from 'rrule-rust';

const rrule = new RRule({
  frequency: Frequency.Daily,
  count: 5,
});
const set = new RRuleSet({
  dtstart: new DtStart(DateTime.local(1997, 9, 2, 9, 0, 0), 'US/Eastern'),
  rrules: [rrule],
});

const dates = set.all(); // [ DateTime, DateTime, DateTime, DateTime, DateTime ]
const asString = set.toString(); // DTSTART;TZID=US/Eastern:19970902T090000\nFREQ=DAILY;COUNT=5;BYHOUR=9;BYMINUTE=0;BYSECOND=0
```

## Performance

**Test Environment:**

- **Host:** MacBook Pro, 14-inch, 2023
- **OS:** macOS 14.4.1 (23E224)
- **Processor:** Apple M3 Pro
- **Memory:** 36 GB LPDDR5
- **Node.js:** v24.11.1

**Test Case:** Generating 30 daily occurrences using `rruleSet.all()`

#### UTC Timezone

| Implementation   | Without Cache  | With Cache        |
| ---------------- | -------------- | ----------------- |
| **rrule-rust**   | ~240,000 ops/s | ~14,000,000 ops/s |
| **rrule (node)** | ~20,000 ops/s  | ~1,300,000 ops/s  |

#### Other Timezone (Pacific/Kiritimati)

| Implementation   | Without Cache  | With Cache        |
| ---------------- | -------------- | ----------------- |
| **rrule-rust**   | ~235,000 ops/s | ~14,000,000 ops/s |
| **rrule (node)** | ~420 ops/s     | ~1,300,000 ops/s  |

**Run benchmarks yourself:**

```bash
npm run benchmark
```

## License

`rrule-rust` is [MIT licensed](LICENSE.md).
