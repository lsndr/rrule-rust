import { RRuleSet, RRule } from '../../../src';
import { describe, it, expect } from 'vitest';

describe(RRuleSet, () => {
  describe('EXDATE', () => {
    it('should throw when exdate datetimes value type do not match', () => {
      const act = () =>
        RRuleSet.fromString(
          'DTSTART:19970902\nEXDATE:20250101,20250102T000000Z',
        );

      expect(act).toThrow(
        'All EXDATE instances must have the same value type as specified in EXDATE',
      );
    });

    it('should throw when exdate value type and datetimes do not match', () => {
      const act = () =>
        RRuleSet.fromString(
          'DTSTART:19970902\nEXDATE;VALUE=DATE:20250101,20250102T000000Z',
        );

      expect(act).toThrow(
        'All EXDATE instances must have the same value type as specified in EXDATE',
      );
    });

    it('should throw when dtsart value type and exdate value type do not match', () => {
      const act = () =>
        RRuleSet.fromString(
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
        RRuleSet.fromString(
          'DTSTART:19970902\nRDATE:20250101,20250102T000000Z',
        );

      expect(act).toThrow(
        'All RDATE instances must have the same value type as specified in RDATE',
      );
    });

    it('should throw when rdate value type and datetimes do not match', () => {
      const act = () =>
        RRuleSet.fromString(
          'DTSTART:19970902\nRDATE;VALUE=DATE:20250101,20250102T000000Z',
        );

      expect(act).toThrow(
        'All RDATE instances must have the same value type as specified in RDATE',
      );
    });

    it('should throw when dtsart value type and rdate value type do not match', () => {
      const act = () =>
        RRuleSet.fromString(
          'DTSTART:19970902T090000Z\nRDATE;VALUE=DATE:20250101,20250102',
        );

      expect(act).toThrow('RDATE value type does not match DTSTART value type');
    });
  });

  it('should throw when dtstart is datetime, but value type is date', () => {
    const act = () =>
      RRuleSet.fromString(
        'DTSTART;VALUE=DATE:19970902T090000Z\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;BYDAY=MO,WE,FR',
      );

    expect(act).toThrow('DTSTART value and value type do not match');
  });

  it('should throw when dtstart is date, but value type is datetime', () => {
    const act = () =>
      RRuleSet.fromString(
        'DTSTART;VALUE=DATE-TIME:19970902\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;BYDAY=MO,WE,FR',
      );

    expect(act).toThrow('DTSTART value and value type do not match');
  });

  it('should properly parse recurrence with date-only dtstart', () => {
    const set = RRuleSet.fromString(
      'DTSTART:19970902\nRRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR',
    );

    expect(set.toString()).toBe(
      'DTSTART:19970902\nRRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR',
    );
  });

  it('should properly parse recurrence with date-only dtstart value and value type', () => {
    const set = RRuleSet.fromString(
      'DTSTART;VALUE=DATE:19970902\nRRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR',
    );

    expect(set.toString()).toBe(
      'DTSTART;VALUE=DATE:19970902\nRRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR',
    );
  });

  it('should properly parse recurrence with date-time dtstart value and value type', () => {
    const set = RRuleSet.fromString(
      'DTSTART;VALUE=DATE-TIME:19970902T090000Z\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;BYDAY=MO,WE,FR',
    );

    expect(set.toString()).toBe(
      'DTSTART;VALUE=DATE-TIME:19970902T090000Z\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;BYDAY=MO,WE,FR',
    );
  });

  it('should properly parse weekly recurrence', () => {
    const set = RRuleSet.fromString(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;WKST=SU;BYDAY=MO,WE,FR',
    );

    expect(set.toString()).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;BYDAY=MO,WE,FR;WKST=SU',
    );
  });

  it('should properly parse monthly recurrence', () => {
    const set = RRuleSet.fromString(
      'DTSTART;TZID=America/New_York:19970907T090000\nRRULE:FREQ=MONTHLY;INTERVAL=2;COUNT=10;BYDAY=1SU,-1SU',
    );

    expect(set.toString()).toBe(
      'DTSTART;TZID=America/New_York:19970907T090000\nRRULE:FREQ=MONTHLY;INTERVAL=2;COUNT=10;BYDAY=1SU,-1SU',
    );
  });

  it('should throw error on missing start date', () => {
    const act = () => RRuleSet.fromString('FREQ=monthly;COUNT=10;INTERVAL=2');

    expect(act).toThrow('Invalid property: FREQ=monthly;COUNT=10;INTERVAL=2');
  });

  it('should throw error on invalid rule set', () => {
    const act = () => RRuleSet.fromString('Invalid');

    expect(act).toThrow('Invalid property: Invalid');
  });

  it('should throw error on invalid timezone', () => {
    const act = () =>
      RRuleSet.fromString('DTSTART;TZID=Invalid:19970907T090000');

    expect(act).toThrow('Invalid timezone: Invalid');
  });

  it('should throw error on invalid recurrence rule', () => {
    const act = () =>
      RRuleSet.fromString(
        'DTSTART;TZID=America/New_York:19970907T090000\nRRULE:Invalid',
      );

    expect(act).toThrow('Invalid RRULE: Invalid');
  });

  it('should throw error on invalid frequency', () => {
    const act = () =>
      RRuleSet.fromString(
        'DTSTART;TZID=America/New_York:19970907T090000\nRRULE:FREQ=Invalid',
      );

    expect(act).toThrow('Invalid FREQ value: Invalid');
  });

  it('should throw error on invalid interval', () => {
    const act = () =>
      RRuleSet.fromString(
        'DTSTART;TZID=America/New_York:19970907T090000\nRRULE:FREQ=DAILY;INTERVAL=Invalid',
      );

    expect(act).toThrow('Invalid INTERVAL value: Invalid');
  });

  it('should throw error on invalid count', () => {
    const act = () =>
      RRuleSet.fromString(
        'DTSTART;TZID=America/New_York:19970907T090000\nRRULE:FREQ=DAILY;COUNT=Invalid',
      );

    expect(act).toThrow('Invalid COUNT value: Invalid');
  });

  it('should throw error on invalid until', () => {
    const act = () =>
      RRuleSet.fromString(
        'DTSTART;TZID=America/New_York:19970907T090000\nRRULE:FREQ=DAILY;UNTIL=Invalid',
      );

    expect(act).toThrow('Invalid UNTIL value: Invalid');
  });

  it('should throw error on invalid week start', () => {
    const act = () =>
      RRuleSet.fromString(
        'DTSTART;TZID=America/New_York:19970907T090000\nRRULE:FREQ=DAILY;WKST=Invalid',
      );

    expect(act).toThrow('Invalid WKST value: Invalid');
  });

  it('should be able to parse rule set without dtstart', () => {
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).setFromString(
      'RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;WKST=SU;BYDAY=MO,WE,FR',
    );

    expect(set.toString()).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;BYDAY=MO,WE,FR;WKST=SU',
    );
  });

  it('should parse dtstart from string', () => {
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).setFromString(
      'DTSTART;TZID=Asia/Tbilisi:20060101T010000\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;WKST=SU;BYDAY=MO,WE,FR',
    );

    expect(set.toString()).toBe(
      'DTSTART;TZID=Asia/Tbilisi:20060101T010000\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;BYDAY=MO,WE,FR;WKST=SU',
    );
  });

  it('should add rrule with until', () => {
    const set = new RRuleSet(
      Temporal.ZonedDateTime.from('1997-09-02T09:00:00[America/New_York]'),
    ).setFromString(
      'RRULE:FREQ=WEEKLY;WKST=MO;UNTIL=20220513T000000;BYDAY=FR,TH,TU,WE',
    );

    expect(set.toString()).toBe(
      'DTSTART;TZID=America/New_York:19970902T090000\nRRULE:FREQ=WEEKLY;UNTIL=20220513T000000Z;BYDAY=FR,TH,TU,WE;WKST=MO',
    );
  });

  it.each([
    {
      dtstart: 'DTSTART:20240323T170000Z',
      exdate: 'EXDATE;TZID=America/New_York:20240921T130000',
      expected: {
        dtstart_tzid: 'UTC',
        exdate_tz: 'America/New_York',
        exdate_hour: 13,
      },
    },
    {
      dtstart: 'DTSTART;TZID=America/New_York:20240323T170000',
      exdate: 'EXDATE:20240921T130000Z',
      expected: {
        dtstart_tzid: 'America/New_York',
        exdate_tz: 'UTC',
        exdate_hour: 13,
      },
    },
    {
      dtstart: 'DTSTART;TZID=America/New_York:20240323T170000',
      exdate: 'EXDATE;TZID=America/New_York:20240921T170000',
      expected: {
        dtstart_tzid: 'America/New_York',
        exdate_tz: 'America/New_York',
        exdate_hour: 17,
      },
    },
    {
      dtstart: 'DTSTART;TZID=Europe/Moscow:20240323T170000',
      exdate: 'EXDATE;TZID=UTC:20240921T170000',
      expected: {
        dtstart_tzid: 'Europe/Moscow',
        exdate_tz: 'UTC',
        exdate_hour: 17,
      },
    },
  ])(
    'should parse exdate property when dtstart is $dtstart and exdate is $exdate',
    ({ dtstart, exdate, expected }) => {
      const set = RRuleSet.fromString(
        `${dtstart}\n${exdate}\nRRULE:FREQ=WEEKLY;UNTIL=20190208T045959Z;INTERVAL=2;BYDAY=FR`,
      );

      const dt = set.dtstart as Temporal.ZonedDateTime;
      expect(dt.timeZoneId).toBe(expected.dtstart_tzid);

      const exdt = set.exdates[0] as Temporal.ZonedDateTime;
      expect(exdt.timeZoneId).toBe(expected.exdate_tz);
      expect(exdt.hour).toBe(expected.exdate_hour);
      // UTC timezone serializes as Z suffix (no TZID=UTC per RFC 5545)
      const serialized = set.toString();
      if (expected.exdate_tz === 'UTC') {
        const utcForm = exdate.replace(/^EXDATE;TZID=UTC:(.+)$/, 'EXDATE:$1Z');
        expect(serialized).toContain(utcForm);
      } else {
        expect(serialized).toContain(exdate);
      }
    },
  );

  it.each([
    {
      dtstart: 'DTSTART:20240323T170000Z',
      rdate: 'RDATE;TZID=America/New_York:20240921T130000',
      expected: {
        dtstart_tzid: 'UTC',
        rdate_tz: 'America/New_York',
        rdate_hour: 13,
      },
    },
    {
      dtstart: 'DTSTART;TZID=America/New_York:20240323T170000',
      rdate: 'RDATE:20240921T130000Z',
      expected: {
        dtstart_tzid: 'America/New_York',
        rdate_tz: 'UTC',
        rdate_hour: 13,
      },
    },
    {
      dtstart: 'DTSTART;TZID=America/New_York:20240323T170000',
      rdate: 'RDATE;TZID=America/New_York:20240921T170000',
      expected: {
        dtstart_tzid: 'America/New_York',
        rdate_tz: 'America/New_York',
        rdate_hour: 17,
      },
    },
    {
      dtstart: 'DTSTART;TZID=Europe/Moscow:20240323T170000',
      rdate: 'RDATE;TZID=UTC:20240921T170000',
      expected: {
        dtstart_tzid: 'Europe/Moscow',
        rdate_tz: 'UTC',
        rdate_hour: 17,
      },
    },
  ])(
    'should parse rdate property when dtstart is $dtstart and rdate is $rdate',
    ({ dtstart, rdate, expected }) => {
      const set = RRuleSet.fromString(
        `${dtstart}\n${rdate}\nRRULE:FREQ=WEEKLY;UNTIL=20190208T045959Z;INTERVAL=2;BYDAY=FR`,
      );

      const dt = set.dtstart as Temporal.ZonedDateTime;
      expect(dt.timeZoneId).toBe(expected.dtstart_tzid);

      const rdt = set.rdates[0] as Temporal.ZonedDateTime;
      expect(rdt.timeZoneId).toBe(expected.rdate_tz);
      expect(rdt.hour).toBe(expected.rdate_hour);
      // UTC timezone serializes as Z suffix (no TZID=UTC per RFC 5545)
      const serialized = set.toString();
      if (expected.rdate_tz === 'UTC') {
        const utcForm = rdate.replace(/^RDATE;TZID=UTC:(.+)$/, 'RDATE:$1Z');
        expect(serialized).toContain(utcForm);
      } else {
        expect(serialized).toContain(rdate);
      }
    },
  );

  // see https://icalendar.org/iCalendar-RFC-5545/3-2-19-time-zone-identifier.html
  it('should not add TZID=UTC to dates if they are in UTC', () => {
    const utcDate = Temporal.ZonedDateTime.from('2025-01-01T00:00:00[UTC]');

    const set = new RRuleSet({
      dtstart: utcDate,
      rrules: [new RRule(1)],
      exdates: [utcDate],
      rdates: [utcDate],
    });

    expect(set.toString()).toBe(
      'DTSTART:20250101T000000Z\nRRULE:FREQ=MONTHLY\nEXDATE:20250101T000000Z\nRDATE:20250101T000000Z',
    );
  });
});
