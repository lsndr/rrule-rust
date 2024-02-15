#![deny(clippy::all)]

use chrono::{DateTime, Datelike, Month, TimeZone, Timelike, Weekday};
use napi::bindgen_prelude::*;
use replace_with::replace_with_or_abort;
use rrule::{Frequency, NWeekday, RRule, RRuleSet, Tz, Unvalidated};

#[macro_use]
extern crate napi_derive;

#[napi(js_name = "Frequency")]
pub enum JsFrequency {
  Yearly,
  Monthly,
  Weekly,
  Daily,
  Hourly,
  Minutely,
  Secondly,
}

#[napi(js_name = "Weekday")]
pub enum JsWeekday {
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday,
}

#[napi(object, js_name = "NWeekday")]
pub struct JsNWeekday {
  /// If set, this represents the nth occurrence of the weekday.
  /// Otherwise it represents every occurrence of the weekday.
  ///
  /// A negative value represents nth occurrence from the end.
  pub n: Option<i16>,
  pub weekday: JsWeekday,
}

impl From<NWeekday> for JsNWeekday {
  fn from(nday: NWeekday) -> Self {
    match nday {
      NWeekday::Every(weekday) => JsNWeekday {
        n: None,
        weekday: map_rust_weekday(weekday),
      },
      NWeekday::Nth(n, weekday) => JsNWeekday {
        n: Some(n),
        weekday: map_rust_weekday(weekday),
      },
    }
  }
}

impl Into<NWeekday> for JsNWeekday {
  fn into(self) -> NWeekday {
    match self.n {
      Some(n) => NWeekday::Nth(n, map_js_weekday(self.weekday)),
      None => NWeekday::Every(map_js_weekday(self.weekday)),
    }
  }
}

#[napi(js_name = "Month")]
pub enum JsMonth {
  January,
  February,
  March,
  April,
  May,
  June,
  July,
  August,
  September,
  October,
  November,
  December,
}

fn to_unvalidated(rrule: &RRule) -> RRule<Unvalidated> {
  let by_month = rrule
    .get_by_month()
    .iter()
    .map(|m| Month::try_from(*m).unwrap())
    .collect::<Vec<_>>();
  let mut unvalidated = RRule::new(rrule.get_freq())
    .interval(rrule.get_interval())
    .week_start(rrule.get_week_start())
    .by_set_pos(rrule.get_by_set_pos().to_vec())
    .by_month(&by_month)
    .by_month_day(rrule.get_by_month_day().to_vec())
    .by_year_day(rrule.get_by_year_day().to_vec())
    .by_week_no(rrule.get_by_week_no().to_vec())
    .by_weekday(rrule.get_by_weekday().to_vec())
    .by_hour(rrule.get_by_hour().to_vec())
    .by_minute(rrule.get_by_minute().to_vec())
    .by_second(rrule.get_by_second().to_vec());

  if let Some(count) = rrule.get_count() {
    unvalidated = unvalidated.count(count);
  }

  if let Some(until) = rrule.get_until() {
    unvalidated = unvalidated.until(*until);
  }

  unvalidated
}

#[napi(js_name = "RRuleTimezone")]
pub struct RRuleTimezone {
  tz: Tz,
}

#[napi]
impl RRuleTimezone {
  #[napi(constructor)]
  pub fn new(tz: String) -> napi::Result<Self> {
    let tz = map_js_tz(&tz)?;

    Ok(RRuleTimezone::new_with_tz(tz))
  }

  pub fn new_with_tz(tz: Tz) -> Self {
    RRuleTimezone { tz }
  }

  /**
   * The name of the timezone. If the timezone is local, it will return "Local".
   */
  #[napi(getter)]
  pub fn name(&self) -> String {
    self.tz.name().to_string()
  }

  #[napi(getter)]
  pub fn is_local(&self) -> bool {
    self.tz.is_local()
  }
}

#[napi(js_name = "RRuleDateTime")]
pub struct RRuleDateTime {
  date_time: DateTime<Tz>,
}

#[napi]
impl RRuleDateTime {
  #[napi(constructor)]
  pub fn new_with_js_date(
    date: napi::Either<napi::JsDate, f64>,
    timezone: Option<String>,
  ) -> napi::Result<Self> {
    let timestamp = match date {
      Either::A(date) => date.value_of(),
      Either::B(date) => Ok(date),
    }?;
    let mut date_time = Tz::LOCAL.timestamp_nanos((timestamp * 1_000_000f64) as i64);
    if let Some(timezone) = timezone {
      date_time = date_time.with_timezone(&map_js_tz(&timezone)?);
    }

    Ok(RRuleDateTime::new_with_date_time(date_time))
  }

  pub fn new_with_date_time(date_time: DateTime<Tz>) -> Self {
    RRuleDateTime { date_time }
  }

  #[napi(getter)]
  pub fn timestamp(&self) -> i64 {
    self.date_time.timestamp_millis()
  }

  #[napi(getter)]
  pub fn timezone(&self) -> RRuleTimezone {
    RRuleTimezone::new_with_tz(self.date_time.timezone())
  }

  #[napi(getter)]
  pub fn day(&self) -> u32 {
    self.date_time.day()
  }

  #[napi(getter)]
  pub fn month(&self) -> u32 {
    self.date_time.month()
  }

  #[napi(getter)]
  pub fn year(&self) -> i32 {
    self.date_time.year()
  }

  #[napi(getter)]
  pub fn hour(&self) -> u32 {
    self.date_time.hour()
  }

  #[napi(getter)]
  pub fn minute(&self) -> u32 {
    self.date_time.minute()
  }

  #[napi(getter)]
  pub fn second(&self) -> u32 {
    self.date_time.second()
  }

  #[napi(getter)]
  pub fn millisecond(&self) -> u32 {
    let nanoseconds = self.date_time.nanosecond();
    nanoseconds / 1_000_000
  }

  #[napi(getter)]
  pub fn to_string(&self) -> String {
    self.date_time.to_string()
  }

  #[napi(ts_return_type = "Date")]
  pub fn to_date(&self, env: Env) -> napi::Result<napi::JsDate> {
    env.create_date(self.date_time.timestamp_millis() as f64)
  }

  #[napi(ts_return_type = "Date")]
  pub fn to_utc_date(&self, env: Env) -> napi::Result<napi::JsDate> {
    env.create_date(self.date_time.naive_utc().timestamp_millis() as f64)
  }
}

impl From<DateTime<Tz>> for RRuleDateTime {
  fn from(date_time: DateTime<Tz>) -> Self {
    RRuleDateTime::new_with_date_time(date_time)
  }
}

impl Into<DateTime<Tz>> for RRuleDateTime {
  fn into(self) -> DateTime<Tz> {
    self.date_time
  }
}

impl From<napi::JsDate> for RRuleDateTime {
  fn from(date: napi::JsDate) -> Self {
    RRuleDateTime::new_with_js_date(napi::Either::A(date), None).unwrap()
  }
}

impl From<napi::Either<&RRuleDateTime, napi::JsDate>> for RRuleDateTime {
  fn from(date: napi::Either<&RRuleDateTime, napi::JsDate>) -> Self {
    match date {
      Either::A(date) => RRuleDateTime::new_with_date_time(date.date_time),
      Either::B(date) => RRuleDateTime::new_with_js_date(napi::Either::A(date), None).unwrap(),
    }
  }
}

#[napi(js_name = "RRule")]
pub struct JsRRule {
  rrule: RRule<Unvalidated>,
}

#[napi]
impl JsRRule {
  #[napi(constructor)]
  pub fn new(frequency: JsFrequency) -> Self {
    let rrule = RRule::new(map_js_frequency(frequency));

    JsRRule { rrule }
  }

  #[napi(factory, ts_return_type = "RRule")]
  pub fn parse(str: String) -> napi::Result<Self> {
    let rrule: RRule<Unvalidated> = str
      .parse()
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    Ok(JsRRule { rrule })
  }

  #[napi(getter)]
  pub fn frequency(&self) -> napi::Result<JsFrequency> {
    Ok(map_rust_frequency(self.rrule.get_freq()))
  }

  #[napi(getter)]
  pub fn interval(&self) -> napi::Result<u16> {
    Ok(self.rrule.get_interval())
  }

  #[napi(getter)]
  pub fn count(&self) -> napi::Result<Option<u32>> {
    Ok(self.rrule.get_count())
  }

  #[napi(getter, ts_return_type = "NWeekday[]")]
  pub fn by_weekday(&self) -> Vec<JsNWeekday> {
    return self
      .rrule
      .get_by_weekday()
      .iter()
      .map(|nday| JsNWeekday::from(*nday))
      .collect();
  }

  #[napi(getter)]
  pub fn by_hour(&self) -> napi::Result<Vec<u8>> {
    Ok(self.rrule.get_by_hour().to_vec())
  }

  #[napi(getter)]
  pub fn by_minute(&self) -> napi::Result<Vec<u8>> {
    Ok(self.rrule.get_by_minute().to_vec())
  }

  #[napi(getter)]
  pub fn by_second(&self) -> napi::Result<Vec<u8>> {
    Ok(self.rrule.get_by_second().to_vec())
  }

  #[napi(getter)]
  pub fn by_monthday(&self) -> napi::Result<Vec<i8>> {
    Ok(self.rrule.get_by_month_day().to_vec())
  }

  #[napi(getter)]
  pub fn by_setpos(&self) -> napi::Result<Vec<i32>> {
    Ok(self.rrule.get_by_set_pos().to_vec())
  }

  #[napi(getter, ts_return_type = "Month[]")]
  pub fn by_month(&self, env: Env) -> napi::Result<Array> {
    let months = self.rrule.get_by_month();
    let mut arr = env.create_array(0)?;

    for month in months.iter() {
      arr.insert(map_rust_month(month))?;
    }

    Ok(arr)
  }

  #[napi(getter)]
  pub fn by_weekno(&self) -> napi::Result<Vec<i8>> {
    Ok(self.rrule.get_by_week_no().to_vec())
  }

  #[napi(getter)]
  pub fn by_yearday(&self) -> napi::Result<Vec<i16>> {
    Ok(self.rrule.get_by_year_day().to_vec())
  }

  #[napi(getter)]
  pub fn weekstart(&self) -> napi::Result<JsWeekday> {
    Ok(map_rust_weekday(self.rrule.get_week_start()))
  }

  #[napi(getter)]
  pub fn until(&self) -> napi::Result<Option<RRuleDateTime>> {
    Ok(match self.rrule.get_until() {
      Some(until) => Some(RRuleDateTime::new_with_date_time(until.clone())),
      None => None,
    })
  }

  #[napi]
  pub fn to_string(&self) -> napi::Result<String> {
    Ok(self.rrule.to_string())
  }

  #[napi]
  pub fn set_interval(&mut self, interval: u16) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.interval(interval));

    Ok(self)
  }

  #[napi]
  pub fn set_count(&mut self, count: u32) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.count(count));

    Ok(self)
  }

  #[napi]
  pub fn set_by_weekday(
    &mut self,
    #[napi(ts_arg_type = "ReadonlyArray<NWeekday | Weekday>")] weekdays: Vec<
      Either<JsNWeekday, JsWeekday>,
    >,
  ) -> napi::Result<&Self> {
    let by_weekday = weekdays
      .into_iter()
      .map(|weekday| match weekday {
        Either::A(nday) => nday.into(),
        Either::B(weekday) => NWeekday::Every(map_js_weekday(weekday)),
      })
      .collect();

    replace_with_or_abort(&mut self.rrule, |self_| self_.by_weekday(by_weekday));

    Ok(self)
  }

  #[napi]
  pub fn set_by_hour(
    &mut self,
    #[napi(ts_arg_type = "ReadonlyArray<number>")] hours: Vec<u8>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_hour(hours));

    Ok(self)
  }

  #[napi]
  pub fn set_by_minute(
    &mut self,
    #[napi(ts_arg_type = "ReadonlyArray<number>")] minutes: Vec<u8>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_minute(minutes));

    Ok(self)
  }

  #[napi]
  pub fn set_by_second(
    &mut self,
    #[napi(ts_arg_type = "ReadonlyArray<number>")] seconds: Vec<u8>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_second(seconds));

    Ok(self)
  }

  #[napi]
  pub fn set_by_monthday(
    &mut self,
    #[napi(ts_arg_type = "ReadonlyArray<number>")] days: Vec<i8>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_month_day(days));

    Ok(self)
  }

  #[napi]
  pub fn set_by_setpos(
    &mut self,
    #[napi(ts_arg_type = "ReadonlyArray<number>")] poses: Vec<i32>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_set_pos(poses));

    Ok(self)
  }

  #[napi]
  pub fn set_by_month(
    &mut self,
    #[napi(ts_arg_type = "ReadonlyArray<Month>")] months: Array,
  ) -> napi::Result<&Self> {
    let mut vec: Vec<Month> = Vec::new();

    for i in 0..months.len() {
      let month: JsMonth = months.get(i).unwrap().unwrap();

      vec.push(map_js_month(month));
    }

    replace_with_or_abort(&mut self.rrule, |self_| self_.by_month(&vec));

    Ok(self)
  }

  #[napi]
  pub fn set_by_weekno(
    &mut self,
    #[napi(ts_arg_type = "ReadonlyArray<number>")] week_numbers: Vec<i8>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_week_no(week_numbers));

    Ok(self)
  }

  #[napi]
  pub fn set_by_yearday(
    &mut self,
    #[napi(ts_arg_type = "ReadonlyArray<number>")] days: Vec<i16>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_year_day(days));

    Ok(self)
  }

  #[napi]
  pub fn set_weekstart(&mut self, day: JsWeekday) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| {
      self_.week_start(map_js_weekday(day))
    });

    Ok(self)
  }

  #[napi]
  pub fn set_until(
    &mut self,
    date_time: napi::Either<&RRuleDateTime, napi::JsDate>,
  ) -> napi::Result<&Self> {
    let date_time = RRuleDateTime::from(date_time);
    replace_with_or_abort(&mut self.rrule, |self_| self_.until(date_time.date_time));

    Ok(self)
  }

  pub fn validate(&self, dt_start: DateTime<Tz>) -> napi::Result<RRule> {
    return Ok(
      self
        .rrule
        .clone()
        .validate(dt_start)
        .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?,
    );
  }
}

#[napi(js_name = "RRuleSet")]
pub struct JsRRuleSet {
  rrule_set: RRuleSet,
}

#[napi]
impl JsRRuleSet {
  #[napi(constructor)]
  pub fn new(dtstart: napi::Either<&RRuleDateTime, napi::JsDate>) -> napi::Result<Self> {
    let rrule_set = RRuleSet::new(RRuleDateTime::from(dtstart).date_time);

    Ok(JsRRuleSet { rrule_set })
  }

  #[napi(factory, ts_return_type = "RRuleSet")]
  pub fn parse(str: String) -> napi::Result<Self> {
    let rrule_set: RRuleSet = str
      .parse()
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    Ok(JsRRuleSet { rrule_set })
  }

  #[napi]
  pub fn to_string(&self) -> napi::Result<String> {
    Ok(self.rrule_set.to_string())
  }

  #[napi]
  pub fn add_rrule(&mut self, js_rrule: &JsRRule) -> napi::Result<&Self> {
    let dt_start = self.rrule_set.get_dt_start().clone();
    let rrule = js_rrule.validate(dt_start)?;

    replace_with_or_abort(&mut self.rrule_set, |self_| self_.rrule(rrule));

    Ok(self)
  }

  #[napi]
  pub fn add_exrule(&mut self, js_rrule: &JsRRule) -> napi::Result<&Self> {
    let rrule = js_rrule.validate(*self.rrule_set.get_dt_start())?;

    replace_with_or_abort(&mut self.rrule_set, |self_| self_.exrule(rrule));

    Ok(self)
  }

  #[napi]
  pub fn add_exdate(
    &mut self,
    date_time: napi::Either<&RRuleDateTime, napi::JsDate>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule_set, |self_| {
      self_.exdate(RRuleDateTime::from(date_time).date_time)
    });

    Ok(self)
  }

  #[napi]
  pub fn add_rdate(
    &mut self,
    date_time: napi::Either<&RRuleDateTime, napi::JsDate>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule_set, |self_| {
      self_.rdate(RRuleDateTime::from(date_time).date_time)
    });

    Ok(self)
  }

  #[napi(getter)]
  pub fn dtstart(&self) -> RRuleDateTime {
    RRuleDateTime::new_with_date_time(self.rrule_set.get_dt_start().clone())
  }

  #[napi]
  pub fn get_rrules(&self) -> Vec<JsRRule> {
    return self
      .rrule_set
      .get_rrule()
      .iter()
      .map(|rrule| JsRRule {
        rrule: to_unvalidated(rrule),
      })
      .collect();
  }

  #[napi]
  pub fn get_exrules(&self) -> Vec<JsRRule> {
    return self
      .rrule_set
      .get_exrule()
      .iter()
      .map(|rrule| JsRRule {
        rrule: to_unvalidated(rrule),
      })
      .collect();
  }

  #[napi]
  pub fn get_exdates(&self) -> Vec<RRuleDateTime> {
    return self
      .rrule_set
      .get_exdate()
      .iter()
      .map(|date| RRuleDateTime::new_with_date_time(date.clone()))
      .collect();
  }

  #[napi]
  pub fn get_rdates(&self) -> Vec<RRuleDateTime> {
    return self
      .rrule_set
      .get_rdate()
      .iter()
      .map(|date| RRuleDateTime::new_with_date_time(date.clone()))
      .collect();
  }

  fn is_after(
    &self,
    timestamp: DateTime<Tz>,
    after_timestamp: DateTime<Tz>,
    inclusive: Option<bool>,
  ) -> bool {
    let inclusive = inclusive.unwrap_or(false);

    if inclusive && timestamp < after_timestamp {
      return false;
    } else if !inclusive && timestamp <= after_timestamp {
      return false;
    }

    true
  }

  fn is_before(
    &self,
    timestamp: DateTime<Tz>,
    before_timestamp: DateTime<Tz>,
    inclusive: Option<bool>,
  ) -> bool {
    let inclusive = inclusive.unwrap_or(false);

    if inclusive && timestamp > before_timestamp {
      return false;
    } else if !inclusive && timestamp >= before_timestamp {
      return false;
    }

    true
  }

  #[napi]
  pub fn all(&self, limit: Option<u32>) -> Vec<RRuleDateTime> {
    let iter = self.rrule_set.into_iter();
    if let Some(limit) = limit {
      return iter
        .take(limit as usize)
        .map(|date| RRuleDateTime::new_with_date_time(date))
        .collect();
    } else {
      return iter
        .map(|date| RRuleDateTime::new_with_date_time(date))
        .collect();
    }
  }

  #[napi]
  pub fn between(
    &self,
    after: napi::Either<&RRuleDateTime, napi::JsDate>,
    before: napi::Either<&RRuleDateTime, napi::JsDate>,
    inclusive: Option<bool>,
  ) -> napi::Result<Vec<RRuleDateTime>> {
    let _after = RRuleDateTime::from(after).date_time;
    let _before = RRuleDateTime::from(before).date_time;
    return Ok(
      self
        .rrule_set
        .into_iter()
        .take_while(|date| {
          let is_before = self.is_before(*date, _before, inclusive);

          is_before
        })
        .filter(|date| {
          let is_after = self.is_after(*date, _after, inclusive);

          is_after
        })
        .map(|date| RRuleDateTime::new_with_date_time(date))
        .collect::<Vec<_>>(),
    );
  }

  #[napi]
  pub fn occurrences(&self, this: Reference<JsRRuleSet>, env: Env) -> napi::Result<Occurrences> {
    let iter = this.share_with(env, |set| Ok(set.rrule_set.into_iter()))?;
    Ok(Occurrences { iter })
  }
}

fn map_rust_frequency(freq: Frequency) -> JsFrequency {
  match freq {
    Frequency::Daily => JsFrequency::Daily,
    Frequency::Hourly => JsFrequency::Hourly,
    Frequency::Minutely => JsFrequency::Minutely,
    Frequency::Monthly => JsFrequency::Monthly,
    Frequency::Secondly => JsFrequency::Secondly,
    Frequency::Weekly => JsFrequency::Weekly,
    Frequency::Yearly => JsFrequency::Yearly,
  }
}

fn map_js_frequency(freq: JsFrequency) -> Frequency {
  match freq {
    JsFrequency::Daily => Frequency::Daily,
    JsFrequency::Hourly => Frequency::Hourly,
    JsFrequency::Minutely => Frequency::Minutely,
    JsFrequency::Monthly => Frequency::Monthly,
    JsFrequency::Secondly => Frequency::Secondly,
    JsFrequency::Weekly => Frequency::Weekly,
    JsFrequency::Yearly => Frequency::Yearly,
  }
}

fn map_js_weekday(weekday: JsWeekday) -> Weekday {
  match weekday {
    JsWeekday::Monday => Weekday::Mon,
    JsWeekday::Tuesday => Weekday::Tue,
    JsWeekday::Wednesday => Weekday::Wed,
    JsWeekday::Thursday => Weekday::Thu,
    JsWeekday::Friday => Weekday::Fri,
    JsWeekday::Saturday => Weekday::Sat,
    JsWeekday::Sunday => Weekday::Sun,
  }
}

fn map_rust_weekday(weekday: Weekday) -> JsWeekday {
  match weekday {
    Weekday::Mon => JsWeekday::Monday,
    Weekday::Tue => JsWeekday::Tuesday,
    Weekday::Wed => JsWeekday::Wednesday,
    Weekday::Thu => JsWeekday::Thursday,
    Weekday::Fri => JsWeekday::Friday,
    Weekday::Sat => JsWeekday::Saturday,
    Weekday::Sun => JsWeekday::Sunday,
  }
}

fn map_js_month(month: JsMonth) -> Month {
  match month {
    JsMonth::January => Month::January,
    JsMonth::February => Month::February,
    JsMonth::March => Month::March,
    JsMonth::April => Month::April,
    JsMonth::May => Month::May,
    JsMonth::June => Month::June,
    JsMonth::July => Month::July,
    JsMonth::August => Month::August,
    JsMonth::September => Month::September,
    JsMonth::October => Month::October,
    JsMonth::November => Month::November,
    JsMonth::December => Month::December,
  }
}

fn map_rust_month(month: &u8) -> JsMonth {
  match month {
    0 => JsMonth::January,
    1 => JsMonth::February,
    2 => JsMonth::March,
    3 => JsMonth::April,
    4 => JsMonth::May,
    5 => JsMonth::June,
    6 => JsMonth::July,
    7 => JsMonth::August,
    8 => JsMonth::September,
    9 => JsMonth::October,
    10 => JsMonth::November,
    11 => JsMonth::December,
    _ => panic!("Unkown month index: {}", month),
  }
}

fn map_js_tz(tz: &str) -> napi::Result<Tz> {
  let chrono_tz = tz
    .parse()
    .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;
  Ok(Tz::Tz(chrono_tz))
}

#[napi(iterator)]
pub struct Occurrences {
  iter: SharedReference<JsRRuleSet, rrule::RRuleSetIter<'static>>,
}

#[napi]
impl Generator for Occurrences {
  type Yield = RRuleDateTime;
  type Next = ();
  type Return = ();

  fn next(&mut self, _next: Option<Self::Next>) -> Option<Self::Yield> {
    self
      .iter
      .next()
      .map(|date| RRuleDateTime::new_with_date_time(date))
  }
}
