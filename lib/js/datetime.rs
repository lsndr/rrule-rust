use chrono::{Datelike, TimeZone, Timelike};

pub struct DateTime {
  datetime: chrono::DateTime<rrule::Tz>,
}

impl DateTime {
  pub fn new(numeric_datetime: i64, tzid: &str) -> napi::Result<Self> {
    let timezone: chrono_tz::Tz = tzid.parse().map_err(|_| {
      napi::Error::new(
        napi::Status::GenericFailure,
        format!("Invalid timezone: {}", tzid),
      )
    })?;

    Self::new_with_timezone(numeric_datetime, rrule::Tz::Tz(timezone))
  }
  pub fn new_with_timezone(numeric_datetime: i64, timezone: rrule::Tz) -> napi::Result<Self> {
    let year = (numeric_datetime / 10000000000) as i32;
    let month = ((numeric_datetime / 100000000) % 100) as u32;
    let day = ((numeric_datetime / 1000000) % 100) as u32;
    let hour = ((numeric_datetime / 10000) % 100) as u32;
    let minute = ((numeric_datetime / 100) % 100) as u32;
    let second = (numeric_datetime % 100) as u32;

    let datetime = match timezone
      .with_ymd_and_hms(year, month, day, hour, minute, second)
      .single()
    {
      Some(datetime) => Ok(Self { datetime }),
      None => Err(format!("Invalid date: {}", numeric_datetime)),
    };

    Ok(datetime.map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?)
  }

  pub fn timestamp_millis(&self) -> i64 {
    self.datetime.timestamp_millis()
  }

  pub fn numeric(&self) -> i64 {
    let year = self.datetime.year() as i64;
    let month = self.datetime.month() as i64;
    let day = self.datetime.day() as i64;
    let hour = self.datetime.hour() as i64;
    let minute = self.datetime.minute() as i64;
    let second = self.datetime.second() as i64;

    year * 10000000000 + month * 100000000 + day * 1000000 + hour * 10000 + minute * 100 + second
  }
}

impl Into<chrono::DateTime<rrule::Tz>> for DateTime {
  fn into(self) -> chrono::DateTime<rrule::Tz> {
    self.datetime
  }
}

impl From<chrono::DateTime<rrule::Tz>> for DateTime {
  fn from(datetime: chrono::DateTime<rrule::Tz>) -> DateTime {
    DateTime { datetime }
  }
}
