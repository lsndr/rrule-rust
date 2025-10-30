import { RRuleSet, DateTime, RRule, DtStart, ExDate } from '../../src';

describe(RRuleSet, () => {
  describe('EXDATE', () => {
    it('should throw when exdate datetimes value type do not match', () => {
      const act = () =>
        RRuleSet.parse('DTSTART:19970902\nEXDATE:20250101,20250102T000000Z');

      expect(act).toThrow(
        'All EXDATE instances must have the same value type as specified in EXDATE',
      );
    });

    it('should throw when exdate value type and datetimes do not match', () => {
      const act = () =>
        RRuleSet.parse(
          'DTSTART:19970902\nEXDATE;VALUE=DATE:20250101,20250102T000000Z',
        );

      expect(act).toThrow(
        'All EXDATE instances must have the same value type as specified in EXDATE',
      );
    });

    it('should throw when dtsart value type and exdate value type do not match', () => {
      const act = () =>
        RRuleSet.parse(
          'DTSTART:19970902T090000Z\nEXDATE;VALUE=DATE:20250101,20250102',
        );

      expect(act).toThrow(
        'EXDATE value type does not match DTSTART value type',
      );
    });
  });

  describe('RDATE', () => {
    it('should throw when rdate datetimes value type do not match', () => {
      const act = () =>
        RRuleSet.parse('DTSTART:19970902\nRDATE:20250101,20250102T000000Z');

      expect(act).toThrow(
        'All RDATE instances must have the same value type as specified in RDATE',
      );
    });

    it('should throw when rdate value type and datetimes do not match', () => {
      const act = () =>
        RRuleSet.parse(
          'DTSTART:19970902\nRDATE;VALUE=DATE:20250101,20250102T000000Z',
        );

      expect(act).toThrow(
        'All RDATE instances must have the same value type as specified in RDATE',
      );
    });

    it('should throw when dtsart value type and rdate value type do not match', () => {
      const act = () =>
        RRuleSet.parse(
          'DTSTART:19970902T090000Z\nRDATE;VALUE=DATE:20250101,20250102',
        );

      expect(act).toThrow('RDATE value type does not match DTSTART value type');
    });
  });

  it('should throw when dtstart is datetime, but value type is date', () => {
    const act = () =>
      RRuleSet.parse(
        'DTSTART;VALUE=DATE:19970902T090000Z\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;BYDAY=MO,WE,FR',
      );

    expect(act).toThrow('DTSTART value and value type do not match');
  });

  it('should throw when dtstart is date, but value type is datetime', () => {
    const act = () =>
      RRuleSet.parse(
        'DTSTART;VALUE=DATE-TIME:19970902\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;BYDAY=MO,WE,FR',
      );

    expect(act).toThrow('DTSTART value and value type do not match');
  });

  it('should properly parse recurrence with date-only dtstart', () => {
    const set = RRuleSet.parse(
      'DTSTART:19970902\nRRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR',
    );

    expect(set.toString()).toBe(
      'DTSTART:19970902\nRRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR',
    );
  });

  it('should properly parse recurrence with date-only dtstart value and value type', () => {
    const set = RRuleSet.parse(
      'DTSTART;VALUE=DATE:19970902\nRRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR',
    );

    expect(set.toString()).toBe(
      'DTSTART;VALUE=DATE:19970902\nRRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR',
    );
  });

  it('should properly parse recurrence with date-time dtstart value and value type', () => {
    const set = RRuleSet.parse(
      'DTSTART;VALUE=DATE-TIME:19970902T090000Z\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;BYDAY=MO,WE,FR',
    );

    expect(set.toString()).toBe(
      'DTSTART;VALUE=DATE-TIME:19970902T090000Z\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;BYDAY=MO,WE,FR',
    );
  });

  it('should properly parse weekly recurrence', () => {
    const set = RRuleSet.parse(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;WKST=SU;BYDAY=MO,WE,FR',
    );

    expect(set.toString()).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;BYDAY=MO,WE,FR;WKST=SU',
    );
  });

  it('should properly parse weekly recurrence', () => {
    const set = RRuleSet.parse(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;WKST=SU;BYDAY=MO,WE,FR',
    );

    expect(set.toString()).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;BYDAY=MO,WE,FR;WKST=SU',
    );
  });

  it('should properly parse monthly recurrence', () => {
    const set = RRuleSet.parse(
      'DTSTART;TZID=US/Eastern:19970907T090000\nRRULE:FREQ=MONTHLY;INTERVAL=2;COUNT=10;BYDAY=1SU,-1SU',
    );

    expect(set.toString()).toBe(
      'DTSTART;TZID=US/Eastern:19970907T090000\nRRULE:FREQ=MONTHLY;INTERVAL=2;COUNT=10;BYDAY=1SU,-1SU',
    );
  });

  it('should throw error on missing start date', () => {
    const act = () => RRuleSet.parse('FREQ=monthly;COUNT=10;INTERVAL=2');

    expect(act).toThrow('Invalid property: FREQ=monthly;COUNT=10;INTERVAL=2');
  });

  it('should throw error on invalid rule set', () => {
    const act = () => RRuleSet.parse('Invalid');

    expect(act).toThrow('Invalid property: Invalid');
  });

  it('should throw error on invalid timezone', () => {
    const act = () => RRuleSet.parse('DTSTART;TZID=Invalid:19970907T090000');

    expect(act).toThrow('Invalid timezone: Invalid');
  });

  it('should throw error on invalid recurrence rule', () => {
    const act = () =>
      RRuleSet.parse('DTSTART;TZID=US/Eastern:19970907T090000\nRRULE:Invalid');

    expect(act).toThrow('Invalid RRULE: Invalid');
  });

  it('should throw error on invalid frequency', () => {
    const act = () =>
      RRuleSet.parse(
        'DTSTART;TZID=US/Eastern:19970907T090000\nRRULE:FREQ=Invalid',
      );

    expect(act).toThrow('Invalid FREQ value: Invalid');
  });

  it('should throw error on invalid interval', () => {
    const act = () =>
      RRuleSet.parse(
        'DTSTART;TZID=US/Eastern:19970907T090000\nRRULE:FREQ=DAILY;INTERVAL=Invalid',
      );

    expect(act).toThrow('Invalid INTERVAL value: Invalid');
  });

  it('should throw error on invalid count', () => {
    const act = () =>
      RRuleSet.parse(
        'DTSTART;TZID=US/Eastern:19970907T090000\nRRULE:FREQ=DAILY;COUNT=Invalid',
      );

    expect(act).toThrow('Invalid COUNT value: Invalid');
  });

  it('should throw error on invalid until', () => {
    const act = () =>
      RRuleSet.parse(
        'DTSTART;TZID=US/Eastern:19970907T090000\nRRULE:FREQ=DAILY;UNTIL=Invalid',
      );

    expect(act).toThrow('Invalid UNTIL value: Invalid');
  });

  it('should throw error on invalid week start', () => {
    const act = () =>
      RRuleSet.parse(
        'DTSTART;TZID=US/Eastern:19970907T090000\nRRULE:FREQ=DAILY;WKST=Invalid',
      );

    expect(act).toThrow('Invalid WKST value: Invalid');
  });

  it('should be able to parse rule set without dtstart', () => {
    const set = new RRuleSet(
      new DtStart({
        datetime: DateTime.create(1997, 9, 2, 9, 0, 0, false),
        tzid: 'US/Eastern',
      }),
    ).setFromString(
      'RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;WKST=SU;BYDAY=MO,WE,FR',
    );

    expect(set.toString()).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;BYDAY=MO,WE,FR;WKST=SU',
    );
  });

  it('should parse dtstart from string', () => {
    const set = new RRuleSet(
      new DtStart({
        datetime: DateTime.create(1997, 9, 2, 9, 0, 0, false),
        tzid: 'US/Eastern',
      }),
    ).setFromString(
      'DTSTART;TZID=Asia/Tbilisi:20060101T010000\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;WKST=SU;BYDAY=MO,WE,FR',
    );

    expect(set.toString()).toBe(
      'DTSTART;TZID=Asia/Tbilisi:20060101T010000\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;BYDAY=MO,WE,FR;WKST=SU',
    );
  });

  it('should add rrule with until', () => {
    const set = new RRuleSet(
      new DtStart({
        datetime: DateTime.create(1997, 9, 2, 9, 0, 0, false),
        tzid: 'US/Eastern',
      }),
    ).setFromString(
      'RRULE:FREQ=WEEKLY;WKST=MO;UNTIL=20220513T000000;BYDAY=FR,TH,TU,WE',
    );

    expect(set.toString()).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;UNTIL=20220513T000000;BYDAY=FR,TH,TU,WE;WKST=MO',
    );
  });

  it.each([
    {
      dtstart: 'DTSTART:20240323T170000Z',
      exdate: 'EXDATE;TZID=America/New_York:20240921T130000',
      expected: {
        tzid: undefined,
        exdates: [
          new ExDate(
            [DateTime.create(2024, 9, 21, 13, 0, 0, false)],
            'America/New_York',
          ),
        ],
      },
    },
    {
      dtstart: 'DTSTART;TZID=America/New_York:20240323T170000',
      exdate: 'EXDATE:20240921T130000Z',
      expected: {
        tzid: 'America/New_York',
        exdates: [new ExDate([DateTime.create(2024, 9, 21, 13, 0, 0, true)])],
      },
    },
    {
      dtstart: 'DTSTART;TZID=America/New_York:20240323T170000',
      exdate: 'EXDATE;TZID=America/New_York:20240921T170000',
      expected: {
        tzid: 'America/New_York',
        exdates: [
          new ExDate(
            [DateTime.create(2024, 9, 21, 17, 0, 0, false)],
            'America/New_York',
          ),
        ],
      },
    },
    {
      dtstart: 'DTSTART;TZID=Europe/Moscow:20240323T170000',
      exdate: 'EXDATE;TZID=UTC:20240921T170000',
      expected: {
        tzid: 'Europe/Moscow',
        exdates: [
          new ExDate([DateTime.create(2024, 9, 21, 17, 0, 0, false)], 'UTC'),
        ],
      },
    },
  ])(
    'should parse exdate property when dtstart is $dtstart and exdate is $exdate',
    ({ dtstart, exdate, expected }) => {
      const set = RRuleSet.parse(
        `${dtstart}\n${exdate}\nRRULE:FREQ=WEEKLY;UNTIL=20190208T045959Z;INTERVAL=2;BYDAY=FR`,
      );

      expect(set.dtstart.tzid).toBe(expected.tzid);
      expect(set.exdates).toEqualPlain(expected.exdates);
      expect(set.toString()).toContain(exdate);
    },
  );

  it.each([
    {
      dtstart: 'DTSTART:20240323T170000Z',
      rdate: 'RDATE;TZID=America/New_York:20240921T130000',
      expected: {
        tzid: undefined,
        rdates: [DateTime.create(2024, 9, 21, 17, 0, 0, true)],
      },
    },
    {
      dtstart: 'DTSTART;TZID=America/New_York:20240323T170000',
      rdate: 'RDATE:20240921T130000Z',
      expected: {
        tzid: 'America/New_York',
        rdates: [DateTime.create(2024, 9, 21, 9, 0, 0, false)],
      },
    },
    {
      dtstart: 'DTSTART;TZID=America/New_York:20240323T170000',
      rdate: 'RDATE;TZID=America/New_York:20240921T170000',
      expected: {
        tzid: 'America/New_York',
        rdates: [DateTime.create(2024, 9, 21, 17, 0, 0, false)],
      },
    },
    {
      dtstart: 'DTSTART;TZID=Europe/Moscow:20240323T170000',
      rdate: 'RDATE;TZID=UTC:20240921T170000',
      expected: {
        tzid: 'Europe/Moscow',
        rdates: [DateTime.create(2024, 9, 21, 20, 0, 0, false)],
      },
    },
  ])(
    'should parse rdate property when dtstart is $dtstart and rdate is $rdate',
    ({ dtstart, rdate, expected }) => {
      const set = RRuleSet.parse(
        `${dtstart}\n${rdate}\nRRULE:FREQ=WEEKLY;UNTIL=20190208T045959Z;INTERVAL=2;BYDAY=FR`,
      );

      expect(set.dtstart.tzid).toBe(expected.tzid);
      expect(set.rdates).toEqualPlain(expected.rdates);
      expect(set.toString()).toContain(rdate);
    },
  );

  // see https://icalendar.org/iCalendar-RFC-5545/3-2-19-time-zone-identifier.html
  it('should not add TZID=UTC to dates if they are in UTC', () => {
    const utcDate = DateTime.fromPlain({
      year: 2025,
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      utc: true,
    });

    const set = new RRuleSet({
      dtstart: new DtStart({
        datetime: utcDate,
      }),
      rrules: [new RRule(1)],
      exdates: [new ExDate([utcDate])],
      rdates: [utcDate],
    });

    expect(set.toString()).toBe(
      'DTSTART:20250101T000000Z\nRRULE:FREQ=MONTHLY\nEXDATE:20250101T000000Z\nRDATE:20250101T000000Z',
    );
  });
});
