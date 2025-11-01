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
});
