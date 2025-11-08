import { DateTime } from '../src';
import * as luxon from 'luxon';

describe(DateTime, () => {
  describe('toTimestamp', () => {
    test('should return timestamp for utc date', () => {
      const datetime = DateTime.utc(2005, 9, 4, 9, 1, 2);

      expect(datetime.toTimestamp()).toBe(Date.UTC(2005, 9 - 1, 4, 9, 1, 2));
    });

    test.each([
      DateTime.local(2005, 9, 4, 9, 1, 2),
      DateTime.create(2005, 9, 4, 9, 1, 2, false),
      DateTime.date(2005, 9, 4),
    ])('should fail to return timestamp for non-utc date %s', (datetime) => {
      expect(() => datetime.toTimestamp()).toThrow(
        new Error('There is no information about timestamp'),
      );
    });
  });

  describe('toDate', () => {
    test('should return date for utc date', () => {
      const datetime = DateTime.utc(2005, 9, 4, 9, 1, 2);

      expect(datetime.toDate()).toEqual(
        new Date(Date.UTC(2005, 9 - 1, 4, 9, 1, 2)),
      );
    });

    test.each([
      DateTime.local(2005, 9, 4, 9, 1, 2),
      DateTime.create(2005, 9, 4, 9, 1, 2, false),
      DateTime.date(2005, 9, 4),
    ])('should fail to return date for non-utc date %s', (datetime) => {
      expect(() => datetime.toDate()).toThrow(
        new Error('There is no information about timestamp'),
      );
    });
  });

  describe('create', () => {
    test.each([
      {
        year: 3025,
        month: 9,
        day: 28,
        hour: 0,
        minute: 0,
        second: 0,
        utc: false,
      },
      {
        year: 2005,
        month: 9,
        day: 4,
        hour: 9,
        minute: 1,
        second: 22,
        utc: true,
      },
    ])('should create object from %j', (input) => {
      const datetime = DateTime.create(
        input.year,
        input.month,
        input.day,
        input.hour,
        input.minute,
        input.second,
        input.utc,
      );

      expect(datetime.year).toBe(input.year);
      expect(datetime.month).toBe(input.month);
      expect(datetime.day).toBe(input.day);
      expect(datetime.time.hour).toBe(input.hour);
      expect(datetime.time.minute).toBe(input.minute);
      expect(datetime.time.second).toBe(input.second);
      expect(datetime.time.utc).toBe(input.utc);
    });
  });

  describe('utc', () => {
    test('should create utc object from', () => {
      const datetime = DateTime.utc(2005, 9, 4, 9, 1, 2);

      expect(datetime.time.utc).toBeTruthy();
    });
  });

  describe('local', () => {
    test('should create local object from', () => {
      const datetime = DateTime.local(2005, 9, 4, 9, 1, 2);

      expect(datetime.time.utc).toBeFalsy();
    });
  });

  describe('fromPlain', () => {
    test.each([
      {
        year: 1997,
        month: 9,
        day: 3,
        hour: 9,
        minute: 0,
        second: 0,
        utc: false,
      },
      {
        year: 2005,
        month: 9,
        day: 4,
        hour: 9,
        minute: 1,
        second: 22,
        utc: true,
      },
    ])('should create datetime from %j', (input) => {
      const datetime = DateTime.fromPlain(input);

      expect(datetime.year).toBe(input.year);
      expect(datetime.month).toBe(input.month);
      expect(datetime.day).toBe(input.day);
      expect(datetime.time.hour).toBe(input.hour);
      expect(datetime.time.minute).toBe(input.minute);
      expect(datetime.time.second).toBe(input.second);
      expect(datetime.time.utc).toBe(!!input.utc);
    });

    test('should be be compatible with luxon', () => {
      const luxonDateTime = luxon.DateTime.now();

      const object = DateTime.fromPlain(luxonDateTime);

      expect(luxonDateTime.year).toBe(object.year);
      expect(luxonDateTime.month).toBe(object.month);
      expect(luxonDateTime.day).toBe(object.day);
      expect(luxonDateTime.hour).toBe(object.time.hour);
      expect(luxonDateTime.minute).toBe(object.time.minute);
      expect(luxonDateTime.second).toBe(object.time.second);
    });
  });

  describe('toPlain', () => {
    test.each([
      {
        year: 1997,
        month: 9,
        day: 3,
        hour: 9,
        minute: 0,
        second: 0,
        utc: false,
      },
      {
        year: 2005,
        month: 9,
        day: 4,
        hour: 9,
        minute: 1,
        second: 22,
        utc: true,
      },
    ])('should convert datetime %j to plain object', (input) => {
      const datetime = DateTime.create(
        input.year,
        input.month,
        input.day,
        input.hour,
        input.minute,
        input.second,
        input.utc,
      );
      const object = datetime.toPlain();

      expect(object).toEqual({
        year: input.year,
        month: input.month,
        day: input.day,
        hour: input.hour,
        minute: input.minute,
        second: input.second,
        utc: input.utc,
      });
    });

    test.each([
      {
        year: 2005,
        month: 9,
        day: 4,
      },
    ])('should convert date %j to plain object', (input) => {
      const datetime = DateTime.create(input.year, input.month, input.day);
      const object = datetime.toPlain();

      expect(object).toEqual({
        year: input.year,
        month: input.month,
        day: input.day,
      });
    });

    test.each([
      {
        year: 1997,
        month: 9,
        day: 3,
        hour: 9,
        minute: 0,
        second: 0,
        utc: false,
      },
      {
        year: 2005,
        month: 9,
        day: 4,
        hour: 9,
        minute: 1,
        second: 22,
        utc: true,
      },
    ])('should convert %j to plain object (strip utc)', (input) => {
      const datetime = DateTime.create(
        input.year,
        input.month,
        input.day,
        input.hour,
        input.minute,
        input.second,
        input.utc,
      );
      const object = datetime.toPlain({ stripUtc: true });

      expect(object).toEqual({
        year: input.year,
        month: input.month,
        day: input.day,
        hour: input.hour,
        minute: input.minute,
        second: input.second,
      });
    });

    test("should be be compatible with Luxon's DateTime.fromObject", () => {
      const datetime = DateTime.create(1997, 9, 3, 9, 4, 7, false);
      const object = datetime.toPlain({ stripUtc: true });

      const luxonDateTime = luxon.DateTime.fromObject(object);

      expect(luxonDateTime.year).toBe(object.year);
      expect(luxonDateTime.month).toBe(object.month);
      expect(luxonDateTime.day).toBe(object.day);
      expect(luxonDateTime.hour).toBe(object.hour);
      expect(luxonDateTime.minute).toBe(object.minute);
      expect(luxonDateTime.second).toBe(object.second);
    });
  });

  describe('toString', () => {
    test.each([
      {
        input: {
          year: 1997,
          month: 9,
          day: 3,
          hour: 9,
          minute: 0,
          second: 0,
          utc: false,
        },
        expected: '19970903T090000',
      },
      {
        input: {
          year: 2005,
          month: 9,
          day: 4,
          hour: 9,
          minute: 1,
          second: 22,
          utc: true,
        },
        expected: '20050904T090122Z',
      },
    ])('should convert $input to $expected', ({ input, expected }) => {
      const datetime = DateTime.create(
        input.year,
        input.month,
        input.day,
        input.hour,
        input.minute,
        input.second,
        input.utc,
      );

      const asString = datetime.toString();

      expect(asString).toBe(expected);
    });

    test("should be be compatible with Luxon's DateTime.fromObject", () => {
      const datetime = DateTime.create(1997, 9, 3, 9, 4, 7, false);
      const object = datetime.toPlain({ stripUtc: true });

      const luxonDateTime = luxon.DateTime.fromObject(object);

      expect(luxonDateTime.year).toBe(object.year);
      expect(luxonDateTime.month).toBe(object.month);
      expect(luxonDateTime.day).toBe(object.day);
      expect(luxonDateTime.hour).toBe(object.hour);
      expect(luxonDateTime.minute).toBe(object.minute);
      expect(luxonDateTime.second).toBe(object.second);
    });
  });

  describe('fromString', () => {
    test.each([
      {
        input: '19970907T040011',
        expected: {
          year: 1997,
          month: 9,
          day: 7,
          hour: 4,
          minute: 0,
          second: 11,
          utc: false,
        },
      },
      {
        input: '19970903T201010',
        expected: {
          year: 1997,
          month: 9,
          day: 3,
          hour: 20,
          minute: 10,
          second: 10,
          utc: false,
        },
      },
      {
        input: '20050904T090122Z',
        expected: {
          year: 2005,
          month: 9,
          day: 4,
          hour: 9,
          minute: 1,
          second: 22,
          utc: true,
        },
      },
    ])('should create datetime from $input', ({ input, expected }) => {
      const datetime = DateTime.fromString(input);

      expect(datetime.year).toBe(expected.year);
      expect(datetime.month).toBe(expected.month);
      expect(datetime.day).toBe(expected.day);
      expect(datetime.time?.hour).toBe(expected.hour);
      expect(datetime.time?.minute).toBe(expected.minute);
      expect(datetime.time?.second).toBe(expected.second);
      expect(datetime.time?.utc).toBe(expected.utc);
    });

    test.each([
      '23njr',
      '18-05-2024',
      '1970-01-01T00:00:00.000Z',
      'YYYYMMDDTHHMMSSZ',
    ])('should fail create datetime from %s', (input) => {
      const act = () => DateTime.fromString(input);

      expect(act).toThrow('Invalid date');
    });
  });
});
