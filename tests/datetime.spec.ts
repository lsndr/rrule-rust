import { DateTime } from '../src';
import * as luxon from 'luxon';

describe(DateTime, () => {
  describe('fromDate', () => {
    test('should create date time with local zone', () => {
      const date = new Date();

      const now = DateTime.fromDate(date);

      expect(now.year).toBe(date.getFullYear());
      expect(now.month).toBe(date.getMonth() + 1);
      expect(now.day).toBe(date.getDate());
      expect(now.hour).toBe(date.getHours());
      expect(now.minute).toBe(date.getMinutes());
      expect(now.second).toBe(date.getSeconds());
      expect(now.utc).toBe(false);
    });

    test('should create date time with utc zone', () => {
      const date = new Date();

      const now = DateTime.fromDate(date, { utc: true });

      expect(now.year).toBe(date.getUTCFullYear());
      expect(now.month).toBe(date.getUTCMonth() + 1);
      expect(now.day).toBe(date.getUTCDate());
      expect(now.hour).toBe(date.getUTCHours());
      expect(now.minute).toBe(date.getUTCMinutes());
      expect(now.second).toBe(date.getUTCSeconds());
      expect(now.utc).toBe(true);
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
      expect(datetime.hour).toBe(input.hour);
      expect(datetime.minute).toBe(input.minute);
      expect(datetime.second).toBe(input.second);
      expect(datetime.utc).toBe(input.utc);
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
  describe('toDate', () => {
    test.each([
      {
        year: 1997,
        month: 9,
        day: 3,
        hour: 9,
        minute: 0,
        second: 0,
      },
      {
        year: 2005,
        month: 9,
        day: 4,
        hour: 9,
        minute: 1,
        second: 22,
      },
    ])('should convert local date %j to Date object', (input) => {
      const datetime = DateTime.create(
        input.year,
        input.month,
        input.day,
        input.hour,
        input.minute,
        input.second,
        false,
      );
      const date = datetime.toDate();

      expect(date).toEqual(
        new Date(
          input.year,
          input.month - 1,
          input.day,
          input.hour,
          input.minute,
          input.second,
        ),
      );
    });

    test.each([
      {
        year: 1997,
        month: 9,
        day: 3,
        hour: 9,
        minute: 0,
        second: 0,
      },
      {
        year: 2005,
        month: 9,
        day: 4,
        hour: 9,
        minute: 1,
        second: 22,
      },
    ])('should convert utc date %j to Date object', (input) => {
      const datetime = DateTime.create(
        input.year,
        input.month,
        input.day,
        input.hour,
        input.minute,
        input.second,
        true,
      );
      const date = datetime.toDate();

      expect(date).toEqual(
        new Date(
          Date.UTC(
            input.year,
            input.month - 1,
            input.day,
            input.hour,
            input.minute,
            input.second,
          ),
        ),
      );
    });
  });
});
