import { DateTime, ExDate } from '../src';

describe(ExDate, () => {
  describe('fromPlain', () => {
    test.each([
      {
        values: [
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
        ],
        tzid: 'America/New_York',
      },
      {
        values: [
          {
            year: 2024,
            month: 1,
            day: 15,
          },
          {
            year: 2024,
            month: 1,
            day: 22,
          },
        ],
      },
    ])('should create exdate from %j', (input) => {
      const exdate = ExDate.fromPlain(input);

      exdate.values.forEach((dt, index) => {
        const expected = input.values[index];

        expect(dt.year).toBe(expected?.year);
        expect(dt.month).toBe(expected?.month);
        expect(dt.day).toBe(expected?.day);
        // @ts-expect-error time may be undefined
        expect(dt.time?.hour).toBe(expected?.hour);
        // @ts-expect-error time may be undefined
        expect(dt.time?.minute).toBe(expected?.minute);
        // @ts-expect-error time may be undefined
        expect(dt.time?.second).toBe(expected?.second);
        // @ts-expect-error time may be undefined
        expect(dt.time?.utc).toBe(expected?.utc);
      });
      expect(exdate.tzid).toBe(input.tzid);
    });
  });

  describe('toPlain', () => {
    test.each([
      new ExDate(
        [DateTime.create(1997, 9, 3, 9, 0, 0, false)],
        'Europe/Moscow',
      ),
      new ExDate([DateTime.create(2005, 9, 4, 9, 1, 22, true)]),
      new ExDate([DateTime.date(2025, 5, 6)]),
    ])('should convert exdate %s to plain object', (exdate) => {
      const plain = exdate.toPlain();

      plain.values.forEach((dt, index) => {
        const expected = exdate.values[index];

        expect(dt.year).toBe(expected?.year);
        expect(dt.month).toBe(expected?.month);
        expect(dt.day).toBe(expected?.day);
        // @ts-expect-error time may be undefined
        expect(dt.hour).toBe(expected.time?.hour);
        // @ts-expect-error time may be undefined
        expect(dt.minute).toBe(expected.time?.minute);
        // @ts-expect-error time may be undefined
        expect(dt.second).toBe(expected.time?.second);
        // @ts-expect-error time may be undefined
        expect(dt.utc).toBe(expected.time?.utc);
      });
      expect(plain.tzid).toBe(exdate.tzid);
    });
  });
});
