import { DateTime } from '../src';
import * as luxon from 'luxon';

describe(DateTime, () => {
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
      expect(datetime.hour).toBe(input.hour);
      expect(datetime.minute).toBe(input.minute);
      expect(datetime.second).toBe(input.second);
      expect(datetime.utc).toBe(input.utc);
    });
  });

  describe('utc', () => {
    test('should create utc object from', () => {
      const datetime = DateTime.utc(2005, 9, 4, 9, 1, 2);

      expect(datetime.utc).toBeTruthy();
    });
  });

  describe('local', () => {
    test('should create local object from', () => {
      const datetime = DateTime.local(2005, 9, 4, 9, 1, 2);

      expect(datetime.utc).toBeFalsy();
    });
  });

  describe('fromObject', () => {
    test.each([
      {
        year: 1997,
        month: 9,
        day: 7,
        hour: 4,
        minute: 0,
        second: 0,
        utc: undefined,
      },
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
      const datetime = DateTime.fromObject(input, { utc: input.utc });

      expect(datetime.year).toBe(input.year);
      expect(datetime.month).toBe(input.month);
      expect(datetime.day).toBe(input.day);
      expect(datetime.hour).toBe(input.hour);
      expect(datetime.minute).toBe(input.minute);
      expect(datetime.second).toBe(input.second);
      expect(datetime.utc).toBe(!!input.utc);
    });
  });

  describe('toObject', () => {
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
    ])('should convert %j to plain object', (input) => {
      const datetime = DateTime.create(
        input.year,
        input.month,
        input.day,
        input.hour,
        input.minute,
        input.second,
        input.utc,
      );
      const object = datetime.toObject();

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
      const object = datetime.toObject();

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
      const object = datetime.toObject();

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
      expect(datetime.hour).toBe(expected.hour);
      expect(datetime.minute).toBe(expected.minute);
      expect(datetime.second).toBe(expected.second);
      expect(datetime.utc).toBe(expected.utc);
    });

    test.each([
      '23njr',
      '18-05-2024',
      '1970-01-01T00:00:00.000Z',
      'YYYYMMDDTHHMMSSZ',
    ])('should fail create datetime from %s', (input) => {
      const act = () => DateTime.fromString(input);

      expect(act).toThrow('Invalid date time string');
    });
  });
});
