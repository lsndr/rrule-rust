import { DateTime, Frequency, RRule, Weekday } from '../src';
import { Month } from '../src/lib';
import { describe, it, expect } from 'vitest';

describe(RRule, () => {
  describe('constructor', () => {
    it('should create rrule from object', () => {
      const rrule = new RRule({
        frequency: Frequency.Weekly,
        interval: 2,
        until: DateTime.create(1997, 12, 24, 0, 0, 0, true),
        weekstart: Weekday.Sunday,
        byWeekday: [Weekday.Monday, Weekday.Wednesday, Weekday.Friday],
        byHour: [1, 2, 3],
        byMinute: [4, 5, 6],
        bySecond: [7, 8, 9],
        byMonthday: [10, 11, 12],
        bySetpos: [13, 14, 15],
        byMonth: [Month.January, Month.February, Month.March],
        byWeekno: [16, 17, 18],
        byYearday: [19, 20, 21],
      });

      expect(rrule.frequency).toBe(Frequency.Weekly);
      expect(rrule.interval).toBe(2);
      expect(rrule.until).toEqual(DateTime.create(1997, 12, 24, 0, 0, 0, true));
      expect(rrule.weekstart).toBe(Weekday.Sunday);
      expect(rrule.byWeekday).toEqual([
        Weekday.Monday,
        Weekday.Wednesday,
        Weekday.Friday,
      ]);
      expect(rrule.byHour).toEqual([1, 2, 3]);
      expect(rrule.byMinute).toEqual([4, 5, 6]);
      expect(rrule.bySecond).toEqual([7, 8, 9]);
      expect(rrule.byMonthday).toEqual([10, 11, 12]);
      expect(rrule.bySetpos).toEqual([13, 14, 15]);
      expect(rrule.byMonth).toEqual([
        Month.January,
        Month.February,
        Month.March,
      ]);
      expect(rrule.byWeekno).toEqual([16, 17, 18]);
      expect(rrule.byYearday).toEqual([19, 20, 21]);
    });

    it('should create rrule from frequency', () => {
      const rrule = new RRule(Frequency.Weekly);

      expect(rrule.frequency).toBe(Frequency.Weekly);
      expect(rrule.interval).toBeUndefined();
      expect(rrule.until).toBeUndefined();
      expect(rrule.weekstart).toBeUndefined();
      expect(rrule.byWeekday).toEqual([]);
      expect(rrule.byHour).toEqual([]);
      expect(rrule.byMinute).toEqual([]);
      expect(rrule.bySecond).toEqual([]);
      expect(rrule.byMonthday).toEqual([]);
      expect(rrule.bySetpos).toEqual([]);
      expect(rrule.byMonth).toEqual([]);
      expect(rrule.byWeekno).toEqual([]);
      expect(rrule.byYearday).toEqual([]);
    });
  });

  describe('setFrequency', () => {
    it('should set frequency', () => {
      const rrule = new RRule(Frequency.Weekly);

      const newRrule = rrule.setFrequency(Frequency.Daily);

      expect(rrule.frequency).toBe(Frequency.Weekly);
      expect(newRrule.frequency).toBe(Frequency.Daily);
    });
  });

  describe('setInterval', () => {
    it('should set interval', () => {
      const rrule = new RRule(Frequency.Weekly);

      const newRrule = rrule.setInterval(2);

      expect(rrule.interval).toBeUndefined();
      expect(newRrule.interval).toBe(2);
    });
  });

  describe('setCount', () => {
    it('should set count', () => {
      const rrule = new RRule(Frequency.Weekly);

      const newRrule = rrule.setCount(10);

      expect(rrule.count).toBeUndefined();
      expect(newRrule.count).toBe(10);
    });
  });

  describe('setUntil', () => {
    it('should set until', () => {
      const rrule = new RRule(Frequency.Weekly);
      const until = DateTime.create(1997, 12, 24, 0, 0, 0, true);

      const newRrule = rrule.setUntil(until);

      expect(rrule.until).toBeUndefined();
      expect(newRrule.until).toBe(until);
    });
  });

  describe('setWeekstart', () => {
    it('should set weekstart', () => {
      const rrule = new RRule(Frequency.Weekly);

      const newRrule = rrule.setWeekstart(Weekday.Monday);

      expect(rrule.weekstart).toBeUndefined();
      expect(newRrule.weekstart).toBe(Weekday.Monday);
    });
  });

  describe('setByWeekday', () => {
    it('should set byWeekday', () => {
      const rrule = new RRule(Frequency.Weekly);

      const newRrule = rrule.setByWeekday([Weekday.Monday, Weekday.Wednesday]);

      expect(rrule.byWeekday).toEqual([]);
      expect(newRrule.byWeekday).toEqual([Weekday.Monday, Weekday.Wednesday]);
    });
  });

  describe('setByHour', () => {
    it('should set byHour', () => {
      const rrule = new RRule(Frequency.Weekly);

      const newRrule = rrule.setByHour([1, 2]);

      expect(rrule.byHour).toEqual([]);
      expect(newRrule.byHour).toEqual([1, 2]);
    });
  });

  describe('setByMinute', () => {
    it('should set byMinute', () => {
      const rrule = new RRule(Frequency.Weekly);

      const newRrule = rrule.setByMinute([3, 4]);

      expect(rrule.byMinute).toEqual([]);
      expect(newRrule.byMinute).toEqual([3, 4]);
    });
  });

  describe('setBySecond', () => {
    it('should set bySecond', () => {
      const rrule = new RRule(Frequency.Weekly);

      const newRrule = rrule.setBySecond([5, 6]);

      expect(rrule.bySecond).toEqual([]);
      expect(newRrule.bySecond).toEqual([5, 6]);
    });
  });

  describe('setByMonthday', () => {
    it('should set byMonthday', () => {
      const rrule = new RRule(Frequency.Weekly);

      const newRrule = rrule.setByMonthday([7, 8]);

      expect(rrule.byMonthday).toEqual([]);
      expect(newRrule.byMonthday).toEqual([7, 8]);
    });
  });

  describe('setBySetpos', () => {
    it('should set bySetpos', () => {
      const rrule = new RRule(Frequency.Weekly);

      const newRrule = rrule.setBySetpos([9, 10]);

      expect(rrule.bySetpos).toEqual([]);
      expect(newRrule.bySetpos).toEqual([9, 10]);
    });
  });

  describe('setByMonth', () => {
    it('should set byMonth', () => {
      const rrule = new RRule(Frequency.Weekly);

      const newRrule = rrule.setByMonth([Month.April, Month.May]);

      expect(rrule.byMonth).toEqual([]);
      expect(newRrule.byMonth).toEqual([Month.April, Month.May]);
    });
  });

  describe('setByWeekno', () => {
    it('should set byWeekno', () => {
      const rrule = new RRule(Frequency.Weekly);

      const newRrule = rrule.setByWeekno([11, 12]);

      expect(rrule.byWeekno).toEqual([]);
      expect(newRrule.byWeekno).toEqual([11, 12]);
    });
  });

  describe('setByYearday', () => {
    it('should set byYearday', () => {
      const rrule = new RRule(Frequency.Weekly);

      const newRrule = rrule.setByYearday([13, 14]);

      expect(rrule.byYearday).toEqual([]);
      expect(newRrule.byYearday).toEqual([13, 14]);
    });
  });
});
