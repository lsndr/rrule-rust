import {
  DtStart,
  DateTime,
  Frequency,
  RRule,
  RRuleSet,
  ExDate,
  RDate,
} from '../src';

describe(RRuleSet, () => {
  describe('constructor', () => {
    it('should create rrule set from object', () => {
      const rrule = new RRule(Frequency.Weekly).setCount(10);
      const exrule = new RRule(Frequency.Weekly).setCount(10);
      const exdate = new ExDate(DateTime.create(1997, 9, 2, 9, 0, 0, false));
      const rdate = new RDate([DateTime.create(1997, 9, 2, 9, 0, 0, false)]);
      const set = new RRuleSet({
        dtstart: new DtStart({
          value: DateTime.create(1997, 9, 2, 9, 0, 0, false),
          tzid: 'US/Eastern',
        }),
        rrules: [rrule],
        exrules: [exrule],
        exdates: [exdate],
        rdates: [rdate],
      });

      expect(set.dtstart.value).toEqual(
        DateTime.create(1997, 9, 2, 9, 0, 0, false),
      );
      expect(set.dtstart.tzid).toBe('US/Eastern');
      expect(set.rrules).toEqual([rrule]);
      expect(set.exrules).toEqual([exrule]);
      expect(set.exdates).toEqual([exdate]);
      expect(set.rdates).toEqual([rdate]);
    });

    it('should creat rrule set from dtstart', () => {
      const set = new RRuleSet(
        new DtStart({
          value: DateTime.create(1997, 9, 2, 9, 0, 0, false),
          tzid: 'US/Eastern',
        }),
      );

      expect(set.dtstart.value).toEqual(
        DateTime.create(1997, 9, 2, 9, 0, 0, false),
      );
      expect(set.dtstart.tzid).toBe('US/Eastern');
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
        new DtStart({
          value: DateTime.create(1997, 9, 2, 9, 0, 0, false),
          tzid: 'Asia/Tbilisi',
        }),
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
        new DtStart({
          value: DateTime.create(1997, 9, 2, 9, 0, 0, false),
          tzid: 'Asia/Tbilisi',
        }),
      );

      const newSet = set.addExRule(exrule);

      expect(set.exrules).toEqual([]);
      expect(newSet.exrules).toEqual([exrule]);
    });
  });

  describe('addExdate', () => {
    it('should add exdate', () => {
      const exdate = new ExDate([DateTime.create(1997, 9, 2, 9, 0, 0, false)]);
      const set = new RRuleSet(
        new DtStart(DateTime.create(1997, 9, 2, 9, 0, 0, false)).setTzid(
          'Asia/Tbilisi',
        ),
      );

      const newSet = set.addExDate(exdate);

      expect(set.exdates).toEqual([]);
      expect(newSet.exdates).toEqual([exdate]);
    });
  });

  describe('addRdate', () => {
    it('should add rdate', () => {
      const rdate = new RDate([DateTime.create(1997, 9, 2, 9, 0, 0, false)]);
      const set = new RRuleSet(
        new DtStart({
          value: DateTime.create(1997, 9, 2, 9, 0, 0, false),
          tzid: 'Asia/Tbilisi',
        }),
      );

      const newSet = set.addRDate(rdate);

      expect(set.rdates).toEqual([]);
      expect(newSet.rdates).toEqual([rdate]);
    });
  });

  describe('setRrules', () => {
    it('should set rrules', () => {
      const rrule = new RRule(Frequency.Weekly).setCount(10);
      const set = new RRuleSet(
        new DtStart({
          value: DateTime.create(1997, 9, 2, 9, 0, 0, false),
          tzid: 'Asia/Tbilisi',
        }),
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
        new DtStart({
          value: DateTime.create(1997, 9, 2, 9, 0, 0, false),
          tzid: 'Asia/Tbilisi',
        }),
      );

      const newSet = set.setExRules([exrule]);

      expect(set.exrules).toEqual([]);
      expect(newSet.exrules).toEqual([exrule]);
    });
  });

  describe('setExdates', () => {
    it('should set exdates', () => {
      const exdate = new ExDate(DateTime.create(1997, 9, 2, 9, 0, 0, false));
      const set = new RRuleSet(
        new DtStart({
          value: DateTime.create(1997, 9, 2, 9, 0, 0, false),
          tzid: 'Asia/Tbilisi',
        }),
      );

      const newSet = set.setExDates([exdate]);

      expect(set.exdates).toEqual([]);
      expect(newSet.exdates).toEqual([exdate]);
    });
  });

  describe('setRdates', () => {
    it('should set rdates', () => {
      const rdate = new RDate([DateTime.create(1997, 9, 2, 9, 0, 0, false)]);
      const set = new RRuleSet(
        new DtStart({
          value: DateTime.create(1997, 9, 2, 9, 0, 0, false),
          tzid: 'Asia/Tbilisi',
        }),
      );

      const newSet = set.setRDates([rdate]);

      expect(set.rdates).toEqual([]);
      expect(newSet.rdates).toEqual([rdate]);
    });
  });

  describe('all', () => {
    it('should return cached data', () => {
      const set = new RRuleSet(
        new DtStart({
          value: DateTime.date(1997, 9, 2),
          tzid: 'US/Eastern',
        }),
      ).addRRule(new RRule(Frequency.Daily).setCount(10));

      const dates1 = set.all();
      const dates2 = set.all();

      expect(dates1).toEqualPlain([
        DateTime.date(1997, 9, 2),
        DateTime.date(1997, 9, 3),
        DateTime.date(1997, 9, 4),
        DateTime.date(1997, 9, 5),
        DateTime.date(1997, 9, 6),
        DateTime.date(1997, 9, 7),
        DateTime.date(1997, 9, 8),
        DateTime.date(1997, 9, 9),
        DateTime.date(1997, 9, 10),
        DateTime.date(1997, 9, 11),
      ]);
      expect(dates1).toBe(dates2);
    });
  });

  describe('between', () => {
    it('should return cached data', () => {
      const set = new RRuleSet(
        new DtStart({
          value: DateTime.date(1997, 9, 2),
          tzid: 'US/Eastern',
        }),
      ).addRRule(new RRule(Frequency.Daily).setCount(10));

      const dates1 = set.between(
        DateTime.date(1997, 9, 4),
        DateTime.date(1997, 9, 7),
        true,
      );
      const dates2 = set.between(
        DateTime.date(1997, 9, 4),
        DateTime.date(1997, 9, 7),
        true,
      );

      expect(dates1).toEqualPlain([
        DateTime.date(1997, 9, 4),
        DateTime.date(1997, 9, 5),
        DateTime.date(1997, 9, 6),
        DateTime.date(1997, 9, 7),
      ]);
      expect(dates1).toBe(dates2);
    });
  });

  describe('iter', () => {
    it('should return cached data', () => {
      const set = new RRuleSet(
        new DtStart({
          value: DateTime.date(1997, 9, 2),
          tzid: 'US/Eastern',
        }),
      ).addRRule(new RRule(Frequency.Daily).setCount(10));

      const dates1 = [...set];
      const dates2 = [...set];

      expect(dates1).toEqualPlain([
        DateTime.date(1997, 9, 2),
        DateTime.date(1997, 9, 3),
        DateTime.date(1997, 9, 4),
        DateTime.date(1997, 9, 5),
        DateTime.date(1997, 9, 6),
        DateTime.date(1997, 9, 7),
        DateTime.date(1997, 9, 8),
        DateTime.date(1997, 9, 9),
        DateTime.date(1997, 9, 10),
        DateTime.date(1997, 9, 11),
      ]);
      expect(dates1).toEqualPlain(dates2);
    });

    it('should reuse cached data if interrupted', () => {
      const set = new RRuleSet(
        new DtStart({
          value: DateTime.date(1997, 9, 2),
          tzid: 'US/Eastern',
        }),
      ).addRRule(new RRule(Frequency.Daily).setCount(10));

      const dates1: DateTime<undefined>[] = [];

      for (const date of set) {
        dates1.push(date);

        // interrupt
        if (dates1.length >= 2) {
          break;
        }
      }

      const dates2 = [...set];

      expect(dates2).toEqualPlain([
        DateTime.date(1997, 9, 2),
        DateTime.date(1997, 9, 3),
        DateTime.date(1997, 9, 4),
        DateTime.date(1997, 9, 5),
        DateTime.date(1997, 9, 6),
        DateTime.date(1997, 9, 7),
        DateTime.date(1997, 9, 8),
        DateTime.date(1997, 9, 9),
        DateTime.date(1997, 9, 10),
        DateTime.date(1997, 9, 11),
      ]);
      expect(dates1[0]).toBe(dates2[0]);
      expect(dates1[1]).toBe(dates2[1]);
    });
  });
});
