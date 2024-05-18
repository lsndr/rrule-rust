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
});
