use super::RRuleTimezone;
use chrono::DateTime;
use chrono::Datelike;
use chrono::TimeZone;
use chrono::Timelike;
use napi::bindgen_prelude::*;
use napi_derive::napi;
use std::str::FromStr;

#[napi(js_name = "RRuleDateTime")]
pub struct RRuleDateTime {
  date_time: chrono::DateTime<rrule::Tz>,
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

    let mut date_time = rrule::Tz::LOCAL.timestamp_nanos((timestamp * 1_000_000f64) as i64);
    if let Some(timezone) = timezone {
      let tz: rrule::Tz = RRuleTimezone::from_str(&timezone)?.into();

      date_time = date_time.with_timezone(&tz);
    }

    Ok(RRuleDateTime::new_with_date_time(date_time))
  }

  pub fn new_with_date_time(date_time: DateTime<rrule::Tz>) -> Self {
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
    env.create_date(self.date_time.naive_utc().and_utc().timestamp_millis() as f64)
  }

  #[napi(
    ts_return_type = "{ day: number, month: number, year: number, hour: number, minute: number, second: number, millisecond: number }"
  )]
  pub fn to_object(&self, env: Env) -> napi::Result<napi::JsObject> {
    let mut obj = env.create_object()?;

    obj.set_named_property("day", env.create_int32(self.day() as i32)?)?;
    obj.set_named_property("month", env.create_int32(self.month() as i32)?)?;
    obj.set_named_property("year", env.create_int32(self.year() as i32)?)?;
    obj.set_named_property("hour", env.create_int32(self.hour() as i32)?)?;
    obj.set_named_property("minute", env.create_int32(self.minute() as i32)?)?;
    obj.set_named_property("second", env.create_int32(self.second() as i32)?)?;
    obj.set_named_property("millisecond", env.create_int32(self.millisecond() as i32)?)?;

    Ok(obj)
  }
}

impl From<DateTime<rrule::Tz>> for RRuleDateTime {
  fn from(date_time: DateTime<rrule::Tz>) -> Self {
    RRuleDateTime::new_with_date_time(date_time)
  }
}

impl Into<DateTime<rrule::Tz>> for RRuleDateTime {
  fn into(self) -> DateTime<rrule::Tz> {
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
