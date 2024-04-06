import { RRuleDateTime } from '../dist';
import { DateTime } from 'luxon';

test.each([new Date(873205200000), 873205200000])(
  'Can create an RRuleDateTime from a %s',
  (input) => {
    const rruleDateTime = new RRuleDateTime(input, 'US/Eastern');

    expect(rruleDateTime.toDate()).toEqual(new Date(873205200000));
    expect(rruleDateTime.timestamp).toBe(873205200000);
    expect(rruleDateTime.timezone.isLocal).toBe(false);
    expect(rruleDateTime.timezone.name).toBe('US/Eastern');
    expect(rruleDateTime.year).toBe(1997);
    expect(rruleDateTime.month).toBe(9);
    expect(rruleDateTime.day).toBe(2);
    expect(rruleDateTime.hour).toBe(9);
    expect(rruleDateTime.minute).toBe(0);
    expect(rruleDateTime.second).toBe(0);
    expect(rruleDateTime.millisecond).toBe(0);
  },
);

it('Can create a local RRuleDateTime', () => {
  const rruleDateTime = new RRuleDateTime(873205200000);
  const props = [];
  for (const prop in rruleDateTime) {
    props.push(prop);
  }

  expect(rruleDateTime.timestamp).toBe(873205200000);
  expect(rruleDateTime.timezone.isLocal).toBe(true);
  expect(rruleDateTime.timezone.name).toBe('Local');
});

it('Can create a Luxon DateTime from an RRuleDateTime', () => {
  const timestamp = 873205200000;
  const rruleDateTime = new RRuleDateTime(timestamp, 'US/Eastern');
  const luxonDateTime = DateTime.fromObject(rruleDateTime.toObject(), {
    zone: rruleDateTime.timezone.name,
  });

  expect(luxonDateTime.toMillis()).toBe(timestamp);
  expect(luxonDateTime.toISO()).toBe('1997-09-02T09:00:00.000-04:00');
});
