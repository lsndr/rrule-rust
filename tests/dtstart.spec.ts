import { DateTime } from '../src/datetime';
import { DtStart } from '../src/dtstart';
import { describe, it, expect } from 'vitest';

describe('DtStart', () => {
  describe('constructor', () => {
    it.each([
      {
        datetime: DateTime.utc(2024, 1, 1, 12, 0, 0),
        tzid: 'America/New_York',
      },
      {
        datetime: DateTime.date(2024, 1, 1),
      },
    ])('should initiate with %j', ({ datetime, tzid }) => {
      const dtstart = new DtStart(datetime, tzid);

      expect(dtstart.value).toBe(datetime);
      expect(dtstart.tzid).toBe(tzid);
    });
  });

  describe('setTzid', () => {
    it.each([
      {
        initialTz: 'America/New_York',
        newTz: 'Europe/London',
      },
      {
        initialTz: undefined,
        newTz: 'Europe/Moscow',
      },
      {
        initialTz: 'America/New_York',
        newTz: undefined,
      },
    ])(
      'should set new "$newTz" when initial tz is "$initialTz"',
      ({ initialTz, newTz }) => {
        const dtstart = new DtStart(DateTime.date(2024, 1, 1), initialTz);

        const newDtstart = dtstart.setTzid(newTz);

        expect(newDtstart.value).toBe(dtstart.value);
        expect(newDtstart.tzid).toBe(newTz);
        expect(dtstart.tzid).toBe(initialTz);
      },
    );
  });

  describe('setDatetime', () => {
    it.each([
      {
        initial: DateTime.date(2024, 1, 1),
        new: DateTime.date(2024, 12, 31),
      },
      {
        initial: DateTime.utc(2024, 1, 1, 12, 0, 0),
        new: DateTime.utc(2024, 12, 31, 23, 59, 59),
      },
    ])(
      'should set datetime from $initial to $new',
      ({ initial, new: newDatetime }) => {
        const dtstart = new DtStart(initial);

        const newDtstart = dtstart.setValue(newDatetime);

        expect(newDtstart.value).toBe(newDatetime);
        expect(dtstart.value).toBe(initial);
      },
    );
  });

  describe('toPlain', () => {
    it.each([
      {
        datetime: DateTime.utc(2024, 1, 1, 12, 0, 0),
        tzid: 'America/New_York',
        expected: {
          value: {
            year: 2024,
            month: 1,
            day: 1,
            hour: 12,
            minute: 0,
            second: 0,
            utc: true,
          },
          tzid: 'America/New_York',
        },
      },
      {
        datetime: DateTime.date(2024, 1, 1),
        expected: {
          value: {
            year: 2024,
            month: 1,
            day: 1,
          },
        },
      },
    ])(
      'should convert dtstart to plain object: $tzid $datetime',
      ({ datetime, tzid, expected }) => {
        const dtstart = new DtStart(datetime, tzid);

        expect(dtstart.toPlain()).toEqual(expected);
      },
    );
  });

  describe('self.fromPlain', () => {
    it.each([
      {
        dtstart: new DtStart(
          DateTime.local(2024, 1, 1, 12, 0, 0),
          'America/New_York',
        ),
        plain: {
          value: {
            year: 2024,
            month: 1,
            day: 1,
            hour: 12,
            minute: 0,
            second: 0,
            utc: false,
          },
          tzid: 'America/New_York',
        },
      },
      {
        dtstart: new DtStart(DateTime.date(2024, 1, 1)),
        plain: {
          value: {
            year: 2024,
            month: 1,
            day: 1,
          },
        },
      },
    ])(
      'should create dtstart from plain object: $plain',
      ({ dtstart, plain }) => {
        const sub = DtStart.fromPlain(plain);

        expect(dtstart).toEqual(sub);
      },
    );
  });
});
