import { DateTime } from '../src';

describe(DateTime, () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  describe('now', () => {
    test('create object with current date and time', () => {
      jest.useFakeTimers();
      jest.setSystemTime(0);

      const now = DateTime.now();
      const date = new Date();

      expect(now.year).toBe(date.getFullYear());
      expect(now.month).toBe(date.getMonth() + 1);
      expect(now.day).toBe(date.getDate());
      expect(now.hour).toBe(date.getHours());
      expect(now.minute).toBe(date.getMinutes());
      expect(now.second).toBe(date.getSeconds());
      expect(now.utc).toBe(false);
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
    ])('create object from %j', (input) => {
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
      const datetime = DateTime.fromObject(input);

      expect(datetime.year).toBe(input.year);
      expect(datetime.month).toBe(input.month);
      expect(datetime.day).toBe(input.day);
      expect(datetime.hour).toBe(input.hour);
      expect(datetime.minute).toBe(input.minute);
      expect(datetime.second).toBe(input.second);
      expect(datetime.utc).toBe(input.utc);
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
    ])('convert %j to plain object', (input) => {
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

      expect(object).toEqual(input);
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
    ])('convert local date %j to Date object', (input) => {
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
    ])('convert utc date %j to Date object', (input) => {
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
