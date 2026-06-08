import { getTimezones } from './lib';

export type RRuleValue = Temporal.ZonedDateTime | Temporal.PlainDate;

const indexTimezone = getTimezones();
const timezoneIndex = indexTimezone.reduce<Record<string, number>>(
  (acc, tz, i) => {
    acc[tz] = i;
    return acc;
  },
  {},
);

export function tzIdToIndex(id: string): number {
  return timezoneIndex[id]!;
}

export function tzIndexToId(idx: number): string {
  return indexTimezone[idx]!;
}

export function toInt32(value: RRuleValue): Int32Array {
  if (value instanceof Temporal.PlainDate) {
    return new Int32Array([value.year, value.month, value.day, -1, -1, -1, -1]);
  }
  return new Int32Array([
    value.year,
    value.month,
    value.day,
    value.hour,
    value.minute,
    value.second,
    tzIdToIndex(value.timeZoneId),
  ]);
}

export function toFlatInt32(values: readonly RRuleValue[]): Int32Array {
  const arr = new Int32Array(values.length * 7);
  for (let i = 0; i < values.length; i++) {
    const packed = toInt32(values[i]!);
    arr.set(packed, i * 7);
  }
  return arr;
}

export function fromInt32<T extends RRuleValue>(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  tzIdx: number,
): T {
  if (hour === -1) {
    return Temporal.PlainDate.from({ year, month, day }) as T;
  }

  const timeZone = tzIndexToId(tzIdx);

  return new Temporal.ZonedDateTime(BigInt(2), timeZone) as T;
  // @ts-expect-error
  return Temporal.ZonedDateTime.from({
    year,
    month,
    day,
    hour,
    minute,
    second,
    timeZone,
  }) as T;
}

export function fromFlatInt32<T extends RRuleValue>(raw: Int32Array): T[] {
  const result: T[] = [];
  for (let i = 0; i < raw.length; i += 7) {
    result.push(
      fromInt32<T>(
        raw[i]!,
        raw[i + 1]!,
        raw[i + 2]!,
        raw[i + 3]!,
        raw[i + 4]!,
        raw[i + 5]!,
        raw[i + 6]!,
      ),
    );
  }
  return result;
}
