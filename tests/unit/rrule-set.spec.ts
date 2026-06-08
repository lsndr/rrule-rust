import { Frequency, RRule, RRuleSet } from '../../src';
import { describe, it, expect } from 'vitest';

function fmt(dt: Temporal.ZonedDateTime | Temporal.PlainDate): string {
  if ('hour' in dt) {
    return `${dt.year}-${String(dt.month).padStart(2, '0')}-${String(dt.day).padStart(2, '0')}T${String(dt.hour).padStart(2, '0')}:${String(dt.minute).padStart(2, '0')}:${String(dt.second).padStart(2, '0')}`;
  }
  return `${dt.year}-${String(dt.month).padStart(2, '0')}-${String(dt.day).padStart(2, '0')}`;
}

describe(RRuleSet, () => {
  describe('constructor', () => {
    it('should create rrule set from object', () => {
      const rrule = new RRule(Frequency.Weekly).setCount(10);
      const exrule = new RRule(Frequency.Weekly).setCount(10);
      const dtstart = Temporal.ZonedDateTime.from(
        '1997-09-02T09:00:00[America/New_York]',
      );
      const exdate = Temporal.ZonedDateTime.from(
        '1997-09-02T09:00:00[America/New_York]',
      );
      const rdate = Temporal.ZonedDateTime.from(
        '1997-09-02T09:00:00[America/New_York]',
      );
      const set = new RRuleSet({
        dtstart,
        rrules: [rrule],
        exrules: [exrule],
        exdates: [exdate],
        rdates: [rdate],
      });

      expect(set.dtstart.toString()).toBe(dtstart.toString());
      expect(set.rrules).toEqual([rrule]);
      expect(set.exrules).toEqual([exrule]);
      expect(set.exdates.map((d) => d.toString())).toEqual([exdate.toString()]);
      expect(set.rdates.map((d) => d.toString())).toEqual([rdate.toString()]);
    });

    it('should create rrule set from dtstart', () => {
      const dtstart = Temporal.ZonedDateTime.from(
        '1997-09-02T09:00:00[America/New_York]',
      );
      const set = new RRuleSet(dtstart);

      expect(set.dtstart.toString()).toBe(dtstart.toString());
      expect(set.rrules).toEqual([]);
      expect(set.exrules).toEqual([]);
      expect(set.exdates).toEqual([]);
      expect(set.rdates).toEqual([]);
    });
  });

  describe('addRrule', () => {
    it('should add rrule', () => {
      const rrule = new RRule(Frequency.Weekly).setCount(10);
      const set = new RRuleSet(
        Temporal.ZonedDateTime.from('1997-09-02T09:00:00[Asia/Tbilisi]'),
      );

      const newSet = set.addRRule(rrule);

      expect(set.rrules).toEqual([]);
      expect(newSet.rrules).toEqual([rrule]);
    });
  });

  describe('addExrule', () => {
    it('should add exrule', () => {
      const exrule = new RRule(Frequency.Weekly).setCount(10);
      const set = new RRuleSet(
        Temporal.ZonedDateTime.from('1997-09-02T09:00:00[Asia/Tbilisi]'),
      );

      const newSet = set.addExRule(exrule);

      expect(set.exrules).toEqual([]);
      expect(newSet.exrules).toEqual([exrule]);
    });
  });

  describe('addExdate', () => {
    it('should add exdate', () => {
      const exdate = Temporal.ZonedDateTime.from(
        '1997-09-02T09:00:00[Asia/Tbilisi]',
      );
      const set = new RRuleSet(
        Temporal.ZonedDateTime.from('1997-09-02T09:00:00[Asia/Tbilisi]'),
      );

      const newSet = set.addExDate(exdate);

      expect(set.exdates).toEqual([]);
      expect(newSet.exdates.map((d) => d.toString())).toEqual([
        exdate.toString(),
      ]);
    });
  });

  describe('addRdate', () => {
    it('should add rdate', () => {
      const rdate = Temporal.ZonedDateTime.from(
        '1997-09-02T09:00:00[Asia/Tbilisi]',
      );
      const set = new RRuleSet(
        Temporal.ZonedDateTime.from('1997-09-02T09:00:00[Asia/Tbilisi]'),
      );

      const newSet = set.addRDate(rdate);

      expect(set.rdates).toEqual([]);
      expect(newSet.rdates.map((d) => d.toString())).toEqual([
        rdate.toString(),
      ]);
    });
  });

  describe('setRrules', () => {
    it('should set rrules', () => {
      const rrule = new RRule(Frequency.Weekly).setCount(10);
      const set = new RRuleSet(
        Temporal.ZonedDateTime.from('1997-09-02T09:00:00[Asia/Tbilisi]'),
      );

      const newSet = set.setRRules([rrule]);

      expect(set.rrules).toEqual([]);
      expect(newSet.rrules).toEqual([rrule]);
    });
  });

  describe('setExrules', () => {
    it('should set exrules', () => {
      const exrule = new RRule(Frequency.Weekly).setCount(10);
      const set = new RRuleSet(
        Temporal.ZonedDateTime.from('1997-09-02T09:00:00[Asia/Tbilisi]'),
      );

      const newSet = set.setExRules([exrule]);

      expect(set.exrules).toEqual([]);
      expect(newSet.exrules).toEqual([exrule]);
    });
  });

  describe('setExdates', () => {
    it('should set exdates', () => {
      const exdate = Temporal.ZonedDateTime.from(
        '1997-09-02T09:00:00[Asia/Tbilisi]',
      );
      const set = new RRuleSet(
        Temporal.ZonedDateTime.from('1997-09-02T09:00:00[Asia/Tbilisi]'),
      );

      const newSet = set.setExDates([exdate]);

      expect(set.exdates).toEqual([]);
      expect(newSet.exdates.map((d) => d.toString())).toEqual([
        exdate.toString(),
      ]);
    });
  });

  describe('setRdates', () => {
    it('should set rdates', () => {
      const rdate = Temporal.ZonedDateTime.from(
        '1997-09-02T09:00:00[Asia/Tbilisi]',
      );
      const set = new RRuleSet(
        Temporal.ZonedDateTime.from('1997-09-02T09:00:00[Asia/Tbilisi]'),
      );

      const newSet = set.setRDates([rdate]);

      expect(set.rdates).toEqual([]);
      expect(newSet.rdates.map((d) => d.toString())).toEqual([
        rdate.toString(),
      ]);
    });
  });

  describe('all', () => {
    it('should return cached data', () => {
      const set = new RRuleSet(Temporal.PlainDate.from('1997-09-02')).addRRule(
        new RRule(Frequency.Daily).setCount(10),
      );

      const dates1 = set.all();
      const dates2 = set.all();

      expect(dates1.map(fmt)).toEqual([
        '1997-09-02',
        '1997-09-03',
        '1997-09-04',
        '1997-09-05',
        '1997-09-06',
        '1997-09-07',
        '1997-09-08',
        '1997-09-09',
        '1997-09-10',
        '1997-09-11',
      ]);
      expect(dates1).toBe(dates2);
    });
  });

  describe('between', () => {
    it('should return cached data', () => {
      const set = new RRuleSet(Temporal.PlainDate.from('1997-09-02')).addRRule(
        new RRule(Frequency.Daily).setCount(10),
      );

      const dates1 = set.between(
        Temporal.PlainDate.from('1997-09-04'),
        Temporal.PlainDate.from('1997-09-07'),
        true,
      );
      const dates2 = set.between(
        Temporal.PlainDate.from('1997-09-04'),
        Temporal.PlainDate.from('1997-09-07'),
        true,
      );

      expect(dates1.map(fmt)).toEqual([
        '1997-09-04',
        '1997-09-05',
        '1997-09-06',
        '1997-09-07',
      ]);
      expect(dates1).toBe(dates2);
    });
  });

  describe('iter', () => {
    it('should return cached data', () => {
      const set = new RRuleSet(Temporal.PlainDate.from('1997-09-02')).addRRule(
        new RRule(Frequency.Daily).setCount(10),
      );

      const dates1 = [...set];
      const dates2 = [...set];

      expect(dates1.map(fmt)).toEqual([
        '1997-09-02',
        '1997-09-03',
        '1997-09-04',
        '1997-09-05',
        '1997-09-06',
        '1997-09-07',
        '1997-09-08',
        '1997-09-09',
        '1997-09-10',
        '1997-09-11',
      ]);
      expect(dates1.map(fmt)).toEqual(dates2.map(fmt));
    });

    it('should reuse cached data if interrupted', () => {
      const set = new RRuleSet(Temporal.PlainDate.from('1997-09-02')).addRRule(
        new RRule(Frequency.Daily).setCount(10),
      );

      const dates1: Temporal.PlainDate[] = [];

      for (const date of set) {
        dates1.push(date);

        // interrupt
        if (dates1.length >= 2) {
          break;
        }
      }

      const dates2 = [...set];

      expect(dates2.map(fmt)).toEqual([
        '1997-09-02',
        '1997-09-03',
        '1997-09-04',
        '1997-09-05',
        '1997-09-06',
        '1997-09-07',
        '1997-09-08',
        '1997-09-09',
        '1997-09-10',
        '1997-09-11',
      ]);
      expect(dates1[0]?.toString()).toBe(dates2[0]?.toString());
      expect(dates1[1]?.toString()).toBe(dates2[1]?.toString());
    });
  });
});
