use std::fmt;
use std::str::FromStr;

use chrono::Datelike;
use chrono::TimeZone;
use chrono::Timelike;
use napi::bindgen_prelude::Int32Array;

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
  pub fn day(&self) -> u32 {
    self.day
  }

  pub fn month(&self) -> u32 {
    self.month
  }

  pub fn year(&self) -> u32 {
    self.year
  }

  pub fn time(&self) -> &Option<Time> {
    &self.time
  }

  pub fn to_datetime(
    &self,
    timezone: &chrono_tz::Tz,
  ) -> Result<chrono::DateTime<chrono_tz::Tz>, String> {
    let timezone = match &self.time {
      Some(time) => match time.utc {
        true => &chrono_tz::Tz::UTC,
        false => timezone,
      },
      None => timezone,
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
      None => Err(format!("Invalid datetime: {}", self)),
    }
  }

  pub fn derive_value_type(&self) -> ValueType {
    match &self.time {
      Some(_) => ValueType::DateTime,
      None => ValueType::Date,
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

impl From<(i32, i32, i32, i32, i32, i32, i32)> for DateTime {
  fn from(arr: (i32, i32, i32, i32, i32, i32, i32)) -> Self {
    DateTime {
      year: arr.0 as u32,
      month: arr.1 as u32,
      day: arr.2 as u32,
      time: match arr.3 {
        -1 => None,
        _ => Some(Time {
          hour: arr.3 as u32,
          minute: arr.4 as u32,
          second: arr.5 as u32,
          utc: arr.6 == 1,
        }),
      },
    }
  }
}

impl From<Int32Array> for DateTime {
  fn from(arr: Int32Array) -> Self {
    let year = arr[0] as u32;
    let month = arr[1] as u32;
    let day = arr[2] as u32;
    let hour = arr[3];
    let minute = arr[4];
    let second = arr[5];
    let utc = arr[6] == 1;

    let time = match hour {
      -1 => None,
      _ => Some(Time {
        hour: hour as u32,
        minute: minute as u32,
        second: second as u32,
        utc,
      }),
    };

    DateTime {
      year,
      month,
      day,
      time,
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

impl From<&DateTime> for Int32Array {
  fn from(val: &DateTime) -> Self {
    Int32Array::from(vec![
      val.year as i32,
      val.month as i32,
      val.day as i32,
      match &val.time {
        Some(time) => time.hour as i32,
        None => -1,
      },
      match &val.time {
        Some(time) => time.minute as i32,
        None => -1,
      },
      match &val.time {
        Some(time) => time.second as i32,
        None => -1,
      },
      match &val.time {
        Some(time) => {
          if time.utc {
            1
          } else {
            0
          }
        }
        None => -1,
      },
    ])
  }
}

impl From<&DateTime> for i64 {
  fn from(val: &DateTime) -> Self {
    let year = val.year as i64;
    let month = val.month as i64;
    let day = val.day as i64;

    let (hour, minute, second, utc) = match &val.time {
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

impl fmt::Display for DateTime {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    let string = match &self.time {
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
    };

    write!(f, "{}", string)
  }
}
