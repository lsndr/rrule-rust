use std::str::FromStr;

use chrono::Datelike;
use chrono::TimeZone;
use chrono::Timelike;

use crate::rrule::time::Time;
use crate::rrule::value_type::ValueType;

#[derive(Clone)]
pub struct DateTime {
  pub year: u32,
  pub month: u32,
  pub day: u32,
  pub time: Option<Time>,
}

impl DateTime {
  pub fn to_datetime(
    &self,
    timezone: &chrono_tz::Tz,
  ) -> Result<chrono::DateTime<chrono_tz::Tz>, String> {
    let timezone = match &self.time {
      Some(time) => match time.utc {
        true => &chrono_tz::Tz::UTC,
        false => &timezone,
      },
      None => &timezone,
    };

    let (hour, minute, second) = match &self.time {
      Some(time) => (time.hour, time.minute, time.second),
      None => (0, 0, 0),
    };

    match timezone
      .with_ymd_and_hms(self.year as i32, self.month, self.day, hour, minute, second)
      .single()
    {
      Some(datetime) => Ok(datetime),
      None => Err(format!("Invalid datetime: {}", self.to_string())),
    }
  }

  pub fn derive_value_type(&self) -> ValueType {
    match &self.time {
      Some(_) => ValueType::DateTime,
      None => ValueType::Date,
    }
  }

  pub fn to_string(&self) -> String {
    match &self.time {
      Some(time) => format!(
        "{:04}{:02}{:02}T{:02}{:02}{:02}{}",
        self.year,
        self.month,
        self.day,
        time.hour,
        time.minute,
        time.second,
        if time.utc { "Z" } else { "" }
      ),
      None => format!("{:04}{:02}{:02}", self.year, self.month, self.day),
    }
  }

  fn from_str(str: &str) -> Result<Self, String> {
    if !(str.len() == 8 || (str.len() <= 16 && str.len() >= 15)) {
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

    if str.len() > 8 {
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

      return Ok(Self {
        year,
        month,
        day,
        time: Some(Time {
          hour,
          minute,
          second,
          utc,
        }),
      });
    }

    Ok(Self {
      year,
      month,
      day,
      time: None,
    })
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
    let mode = (numeric % 10) as u32;

    let time = match mode {
      0 => Some(Time {
        hour,
        minute,
        second,
        utc: false,
      }),
      1 => Some(Time {
        hour,
        minute,
        second,
        utc: true,
      }),
      _ => None,
    };

    DateTime {
      year,
      month,
      day,
      time,
    }
  }
}

// TODO: chrono datetime is alwats converted into DateTime with Time
// Probabbly there should be a method to convert into DateTime without Time
// And this trait must me removed
impl From<&chrono::DateTime<chrono_tz::Tz>> for DateTime {
  fn from(datetime: &chrono::DateTime<chrono_tz::Tz>) -> Self {
    let year = datetime.year() as u32;
    let month = datetime.month();
    let day = datetime.day();
    let hour = datetime.hour();
    let minute = datetime.minute();
    let second = datetime.second();
    let utc = datetime.timezone() == chrono_tz::Tz::UTC;

    DateTime {
      year,
      month,
      day,
      time: Some(Time {
        hour,
        minute,
        second,
        utc,
      }),
    }
  }
}

impl From<&chrono::DateTime<rrule::Tz>> for DateTime {
  fn from(datetime: &chrono::DateTime<rrule::Tz>) -> Self {
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
      time: Some(Time {
        hour,
        minute,
        second,
        utc,
      }),
    }
  }
}

impl Into<i64> for &DateTime {
  fn into(self) -> i64 {
    let year = self.year as i64;
    let month = self.month as i64;
    let day = self.day as i64;

    let (hour, minute, second, utc) = match &self.time {
      Some(time) => (
        time.hour as i64,
        time.minute as i64,
        time.second as i64,
        if time.utc { 1 } else { 0 },
      ),
      None => (0, 0, 0, 2),
    };

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
    DateTime::from_str(str)
  }
}
