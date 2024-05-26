use std::str::FromStr;

use chrono::Datelike;
use chrono::TimeZone;
use chrono::Timelike;

use super::month;

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

impl Into<String> for DateTime {
  fn into(self) -> String {
    format!(
      "{:04}{:02}{:02}T{:02}{:02}{:02}{}",
      self.year,
      self.month,
      self.day,
      self.hour,
      self.minute,
      self.second,
      if self.utc { "Z" } else { "" }
    )
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

impl FromStr for DateTime {
  type Err = String;

  fn from_str(str: &str) -> Result<Self, Self::Err> {
    if str.len() > 16 || str.len() < 15 {
      return Err(format!("Invalid datetime string: {}", str));
    }

    let year = str
      .get(0..4)
      .ok_or(format!("Can not extract year from: {}", str))?;
    let year: u32 = year
      .parse()
      .map_err(|_| format!("Invalid year: {}", year))?;

    let month = str
      .get(4..6)
      .ok_or(format!("Can not extract month from: {}", str))?;
    let month: u32 = month
      .parse()
      .map_err(|_| format!("Invalid month: {}", month))?;

    let day = str
      .get(6..8)
      .ok_or(format!("Can not extract day from: {}", str))?;
    let day: u32 = day.parse().map_err(|_| format!("Invalid day: {}", day))?;

    let hour = str
      .get(9..11)
      .ok_or(format!("Can not extract hour from: {}", str))?;
    let hour: u32 = hour
      .parse()
      .map_err(|_| format!("Invalid hour: {}", hour))?;

    let minute = str
      .get(11..13)
      .ok_or(format!("Can not extract minute from: {}", str))?;
    let minute: u32 = minute
      .parse()
      .map_err(|_| format!("Invalid minute: {}", minute))?;

    let second = str
      .get(13..15)
      .ok_or(format!("Can not extract second from: {}", str))?;
    let second: u32 = second
      .parse()
      .map_err(|_| format!("Invalid second: {}", second))?;

    let utc = str.get(15..16).unwrap_or("").to_uppercase() == "Z";

    Ok(DateTime {
      year,
      month,
      day,
      hour,
      minute,
      second,
      utc,
    })
  }
}
