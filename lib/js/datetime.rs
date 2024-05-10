use chrono::Datelike;
use chrono::TimeZone;
use chrono::Timelike;

pub struct DateTime {
  year: u32,
  month: u32,
  day: u32,
  hour: u32,
  minute: u32,
  second: u32,
  utc: bool,
}

impl DateTime {
  pub fn to_rrule_datetime(
    &self,
    timezone: &rrule::Tz,
  ) -> napi::Result<chrono::DateTime<rrule::Tz>> {
    let timezone = match self.utc {
      true => &rrule::Tz::UTC,
      false => &timezone,
    };

    match timezone
      .with_ymd_and_hms(
        self.year as i32,
        self.month,
        self.day,
        self.hour,
        self.minute,
        self.second,
      )
      .single()
    {
      Some(datetime) => Ok(datetime),
      None => Err(napi::Error::new(
        napi::Status::GenericFailure,
        format!(
          "Invalid datetime: {}-{}-{} {}:{}:{} {}",
          self.year,
          self.month,
          self.day,
          self.hour,
          self.minute,
          self.second,
          if self.utc { "UTC" } else { "Local" }
        ),
      )),
    }
  }
}

impl From<i64> for DateTime {
  fn from(numeric: i64) -> Self {
    let year = (numeric / 100000000000) as u32;
    let month = ((numeric / 1000000000) % 100) as u32;
    let day = ((numeric / 10000000) % 100) as u32;
    let hour = ((numeric / 100000) % 100) as u32;
    let minute = ((numeric / 1000) % 100) as u32;
    let second = ((numeric / 10) % 100) as u32;
    let utc = (numeric % 10) == 1;

    DateTime {
      year,
      month,
      day,
      hour,
      minute,
      second,
      utc,
    }
  }
}

impl From<chrono::DateTime<rrule::Tz>> for DateTime {
  fn from(datetime: chrono::DateTime<rrule::Tz>) -> Self {
    let year = datetime.year() as u32;
    let month = datetime.month();
    let day = datetime.day();
    let hour = datetime.hour();
    let minute = datetime.minute();
    let second = datetime.second();
    let utc = datetime.timezone() == rrule::Tz::UTC;

    DateTime {
      year,
      month,
      day,
      hour,
      minute,
      second,
      utc,
    }
  }
}

impl Into<i64> for DateTime {
  fn into(self) -> i64 {
    let year = self.year as i64;
    let month = self.month as i64;
    let day = self.day as i64;
    let hour = self.hour as i64;
    let minute = self.minute as i64;
    let second = self.second as i64;
    let utc = if self.utc { 1 } else { 0 };

    year * 100000000000
      + month * 1000000000
      + day * 10000000
      + hour * 100000
      + minute * 1000
      + second * 10
      + utc
  }
}
