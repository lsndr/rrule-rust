import { RRuleSet, DateTime } from '../../src';

describe(RRuleSet, () => {
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

    expect(act).toThrow(`'Invalid' is not a valid timezone`);
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
      DateTime.create(1997, 9, 2, 9, 0, 0, false),
      'US/Eastern',
    ).setFromString(
      'RRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;WKST=SU;BYDAY=MO,WE,FR',
    );

    expect(set.toString()).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;BYDAY=MO,WE,FR;WKST=SU',
    );
  });

  it('should parse dtstart from string', () => {
    const set = new RRuleSet(
      DateTime.create(1997, 9, 2, 9, 0, 0, false),
      'US/Eastern',
    ).setFromString(
      'DTSTART;TZID=Asia/Tbilisi:20060101T010000\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;WKST=SU;BYDAY=MO,WE,FR',
    );

    expect(set.toString()).toBe(
      'DTSTART;TZID=Asia/Tbilisi:20060101T010000\nRRULE:FREQ=WEEKLY;INTERVAL=2;UNTIL=19971224T000000Z;BYDAY=MO,WE,FR;WKST=SU',
    );
  });

  it('should add rrule with until', () => {
    const set = new RRuleSet(
      DateTime.create(1997, 9, 2, 9, 0, 0, false),
      'US/Eastern',
    ).setFromString(
      'RRULE:FREQ=WEEKLY;WKST=MO;UNTIL=20220513T000000;BYDAY=FR,TH,TU,WE',
    );

    expect(set.toString()).toBe(
      'DTSTART;TZID=US/Eastern:19970902T090000\nRRULE:FREQ=WEEKLY;UNTIL=20220513T000000;BYDAY=FR,TH,TU,WE;WKST=MO',
    );
  });
});
