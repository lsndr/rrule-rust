// Patches native Temporal (Node's --harmony-temporal) to expose the finalized spec API.
// Node 24's V8 Temporal uses the pre-finalization API (.timeZone object) whereas the
// TC39 spec (and @js-temporal/polyfill ≥0.5) use .timeZoneId (string).
if (
  typeof Temporal !== 'undefined' &&
  !Object.prototype.hasOwnProperty.call(
    Temporal.ZonedDateTime.prototype,
    'timeZoneId',
  )
) {
  Object.defineProperty(Temporal.ZonedDateTime.prototype, 'timeZoneId', {
    get(this: Temporal.ZonedDateTime) {
      return (this as unknown as { timeZone: { id: string } }).timeZone.id;
    },
    configurable: true,
    enumerable: false,
  });
}
