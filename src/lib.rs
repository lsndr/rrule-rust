#![deny(clippy::all)]

use chrono::{DateTime, Month, TimeZone, Weekday};
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

  #[napi(getter, ts_return_type = "Weekday[]")]
  pub fn by_weekday(&self, env: Env) -> napi::Result<Array> {
    let ndays = self.rrule.get_by_weekday();
    let mut arr = env.create_array(0).unwrap();

    for nday in ndays.iter() {
      let day = match nday {
        NWeekday::Every(day) => *day,
        _ => panic!("Unsupported"),
      };

      arr.insert(map_rust_weekday(day)).unwrap();
    }

    Ok(arr)
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
    let mut arr = env.create_array(0).unwrap();

    for month in months.iter() {
      arr.insert(map_rust_month(month)).unwrap();
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
  pub fn until(&self) -> napi::Result<Option<i64>> {
    Ok(match self.rrule.get_until() {
      Some(until) => Some(until.timestamp_millis()),
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
    #[napi(ts_arg_type = "Weekday[]")] weekdays: Array,
  ) -> napi::Result<&Self> {
    let mut vec: Vec<NWeekday> = Vec::new();

    for i in 0..weekdays.len() {
      let day: JsWeekday = weekdays.get(i).unwrap().unwrap();
      let day = NWeekday::Every(map_js_weekday(day));

      vec.push(day);
    }

    replace_with_or_abort(&mut self.rrule, |self_| self_.by_weekday(vec));

    Ok(self)
  }

  #[napi]
  pub fn set_by_hour(&mut self, hours: Vec<u8>) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_hour(hours));

    Ok(self)
  }

  #[napi]
  pub fn set_by_minute(&mut self, minutes: Vec<u8>) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_minute(minutes));

    Ok(self)
  }

  #[napi]
  pub fn set_by_second(&mut self, seconds: Vec<u8>) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_second(seconds));

    Ok(self)
  }

  #[napi]
  pub fn set_by_monthday(&mut self, days: Vec<i8>) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_month_day(days));

    Ok(self)
  }

  #[napi]
  pub fn set_by_setpos(&mut self, poses: Vec<i32>) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_set_pos(poses));

    Ok(self)
  }

  #[napi]
  pub fn set_by_month(
    &mut self,
    #[napi(ts_arg_type = "Month[]")] months: Array,
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
  pub fn set_by_weekno(&mut self, week_numbers: Vec<i8>) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_week_no(week_numbers));

    Ok(self)
  }

  #[napi]
  pub fn set_by_yearday(&mut self, days: Vec<i16>) -> napi::Result<&Self> {
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
  pub fn set_until(&mut self, timestamp: i64) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| {
      self_.until(Tz::UTC.timestamp_millis_opt(timestamp).unwrap())
    });

    Ok(self)
  }

  pub fn validate(&self, dt_start: DateTime<Tz>) -> RRule {
    self.rrule.clone().validate(dt_start).unwrap()
  }
}

#[napi(js_name = "RRuleSet")]
pub struct JsRRuleSet {
  tz: Tz,
  rrule_set: RRuleSet,
}

#[napi]
impl JsRRuleSet {
  #[napi(constructor)]
  pub fn new(dtstart: i64, tzid: String) -> Self {
    let tz = map_js_tz(&tzid);
    let date = timestamp_to_date_with_tz(dtstart, &tz);
    let rrule_set = RRuleSet::new(date);

    JsRRuleSet { rrule_set, tz }
  }

  #[napi(factory, ts_return_type="RRuleSet")]
  pub fn parse(str: String) -> Self {
    let rrule_set: RRuleSet = str.parse().unwrap();
    let dtstart = rrule_set.get_dt_start();
    let tz = dtstart.timezone();

    JsRRuleSet { rrule_set, tz }
  }

  #[napi]
  pub fn to_string(&self) -> napi::Result<String> {
    Ok(self.rrule_set.to_string())
  }

  #[napi]
  pub fn add_rrule(&mut self, js_rrule: &JsRRule) -> napi::Result<&Self> {
    let dt_start = self.rrule_set.get_dt_start().clone();
    let rrule = js_rrule.validate(dt_start);

    replace_with_or_abort(&mut self.rrule_set, |self_| self_.rrule(rrule));

    Ok(self)
  }

  #[napi]
  pub fn add_exrule(&mut self, js_rrule: &JsRRule) -> napi::Result<&Self> {
    let rrule = js_rrule.validate(*self.rrule_set.get_dt_start());

    replace_with_or_abort(&mut self.rrule_set, |self_| self_.exrule(rrule));

    Ok(self)
  }

  #[napi]
  pub fn add_exdate(&mut self, timestamp: i64) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule_set, |self_| {
      self_.exdate(timestamp_to_date_with_tz(timestamp, &self.tz))
    });

    Ok(self)
  }

  #[napi(getter)]
  pub fn dtstart(&self) -> napi::Result<i64> {
    Ok(self.rrule_set.get_dt_start().timestamp_millis())
  }

  #[napi(getter)]
  pub fn tzid(&self) -> napi::Result<String> {
    Ok(String::from(self.tz.name()))
  }

  /*#[napi(ts_return_type="RRule[]")]
  pub fn get_rrules(&self, env: Env) -> napi::Result<Array> {
    let mut arr = env.create_array(0).unwrap();
    let rrules = self.rrule_set.get_rrule();

    for rrule in rrules.iter() {
      arr.insert(JsRRule {
        freq: map_rust_frequency(rrule.get_freq())
      }).unwrap();
    }

    Ok(arr)
  }*/

  fn is_after(&self, timestamp: i64, after_timestamp: i64, inclusive: Option<bool>) -> bool {
    let inclusive = inclusive.unwrap_or(false);

    if inclusive && timestamp < after_timestamp {
      return false;
    } else if !inclusive && timestamp <= after_timestamp {
      return false;
    }

    true
  }

  fn is_before(&self, timestamp: i64, before_timestamp: i64, inclusive: Option<bool>) -> bool {
    let inclusive = inclusive.unwrap_or(false);

    if inclusive && timestamp > before_timestamp {
      return false;
    } else if !inclusive && timestamp >= before_timestamp {
      return false;
    }

    true
  }

  #[napi(ts_return_type = "number[]")]
  pub fn all(&self, env: Env, limit: Option<u32>) -> napi::Result<Array> {
    let mut arr = env.create_array(0).unwrap();
    let mut left = match limit {
      Some(number) => number,
      None => 0,
    };

    for date in self.rrule_set.into_iter() {
      if left > 0 {
        left = left - 1;
      } else if limit.is_some() {
        break;
      }

      let timestamp = date.timestamp_millis();
      arr.insert(timestamp).unwrap();
    }

    Ok(arr)
  }

  #[napi(ts_return_type = "number[]")]
  pub fn between(&self, env: Env, after: i64, before: i64, inclusive: Option<bool>) -> napi::Result<Array> {
    let mut arr = env.create_array(0).unwrap();

    for date in self.rrule_set.into_iter() {
      let timestamp = date.timestamp_millis();
      let is_after = self.is_after(timestamp, after, inclusive);
      let is_before = self.is_before(timestamp, before, inclusive);

      if is_after && is_before {
        arr.insert(timestamp).unwrap();
      } else if !is_before {
        break;
      }
    }

    Ok(arr)
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

/*fn map_rust_rrule (rrule: RRule) -> JsRRule {
  JsRRule {
    freq: map_rust_frequency(rrule.get_freq()),
    interval: Some(rrule.get_interval()),
    count: rrule.get_count(),
    by_weekday:
  }
}*/

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

fn map_js_tz(tz: &str) -> Tz {
  let chrono_tz = tz.parse().unwrap();
  Tz::Tz(chrono_tz)
}

fn timestamp_to_date_with_tz(timestamp: i64, tz: &Tz) -> DateTime<Tz> {
  Tz::UTC
    .timestamp_millis_opt(timestamp)
    .unwrap()
    .with_timezone(tz)
}
