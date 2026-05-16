use std::fmt;
use std::str::FromStr;

use chrono::{Datelike, NaiveDate, Offset, TimeZone, Timelike};
use chrono_tz::GapInfo;
use napi::bindgen_prelude::Int32Array;

use crate::rrule::value_type::ValueType;

#[derive(Clone, Copy)]
pub enum DateTime {
  Date(NaiveDate),
  DateTime(chrono::DateTime<chrono_tz::Tz>),
}

impl DateTime {
  pub fn to_datetime(
    self,
    fallback_tz: chrono_tz::Tz,
  ) -> Result<chrono::DateTime<chrono_tz::Tz>, String> {
    match self {
      Self::DateTime(dt) => Ok(dt),
      Self::Date(d) => local_to_datetime(d.year(), d.month(), d.day(), 0, 0, 0, fallback_tz),
    }
  }

  pub fn derive_value_type(&self) -> ValueType {
    match self {
      Self::Date(_) => ValueType::Date,
      Self::DateTime(_) => ValueType::DateTime,
    }
  }

  pub fn date(&self) -> NaiveDate {
    match self {
      Self::Date(d) => *d,
      Self::DateTime(dt) => dt.date_naive(),
    }
  }

  pub fn as_datetime(&self) -> Option<chrono::DateTime<chrono_tz::Tz>> {
    match self {
      Self::DateTime(dt) => Some(*dt),
      Self::Date(_) => None,
    }
  }

  pub fn from_str_with_tz(s: &str, fallback_tz: chrono_tz::Tz) -> Result<Self, String> {
    if !(s.len() == 8 || (s.len() >= 15 && s.len() <= 16)) {
      return Err(format!("Invalid datetime string: {}", s));
    }

    let year: i32 = parse_field(s, 0, 4, "year")?;
    let month: u32 = parse_field(s, 4, 6, "month")?;
    let day: u32 = parse_field(s, 6, 8, "day")?;

    if s.len() == 8 {
      let d =
        NaiveDate::from_ymd_opt(year, month, day).ok_or_else(|| format!("Invalid date: {}", s))?;
      return Ok(Self::Date(d));
    }

    let hour: u32 = parse_field(s, 9, 11, "hour")?;
    let minute: u32 = parse_field(s, 11, 13, "minute")?;
    let second: u32 = parse_field(s, 13, 15, "second")?;

    let tz = if s.len() == 16 && s.as_bytes()[15].eq_ignore_ascii_case(&b'Z') {
      chrono_tz::Tz::UTC
    } else {
      fallback_tz
    };

    let dt = local_to_datetime(year, month, day, hour, minute, second, tz)?;
    Ok(Self::DateTime(dt))
  }
}

fn parse_field<T: FromStr>(s: &str, start: usize, end: usize, name: &str) -> Result<T, String> {
  s.get(start..end)
    .ok_or_else(|| format!("Cannot extract {} from: {}", name, s))?
    .parse()
    .map_err(|_| format!("Invalid {}: {}", name, s.get(start..end).unwrap_or("")))
}

fn local_to_datetime(
  year: i32,
  month: u32,
  day: u32,
  hour: u32,
  minute: u32,
  second: u32,
  tz: chrono_tz::Tz,
) -> Result<chrono::DateTime<chrono_tz::Tz>, String> {
  if let Some(naive) =
    NaiveDate::from_ymd_opt(year, month, day).and_then(|d| d.and_hms_opt(hour, minute, second))
  {
    let local = tz.from_local_datetime(&naive);

    if let Some(dt) = local.single() {
      return Ok(dt);
    }

    if let Some(dt) = local.earliest() {
      return Ok(dt);
    }

    if let Some(gap_info) = GapInfo::new(&naive, &tz) {
      if let (Some((_, before_gap_tz)), Some(after_gap_datetime)) = (gap_info.begin, gap_info.end) {
        if let Some(dt) = tz
          .from_local_datetime(&(naive - before_gap_tz.fix() + after_gap_datetime.offset().fix()))
          .single()
        {
          return Ok(dt);
        }
      }
    }
  }

  Err(format!(
    "Invalid datetime: {:04}-{:02}-{:02}T{:02}:{:02}:{:02} in {}",
    year,
    month,
    day,
    hour,
    minute,
    second,
    tz.name()
  ))
}

pub fn tz_from_index(idx: i32) -> Option<chrono_tz::Tz> {
  if idx < 0 {
    return None;
  }
  chrono_tz::TZ_VARIANTS.get(idx as usize).copied()
}

pub fn index_from_tz(tz: chrono_tz::Tz) -> i32 {
  chrono_tz::TZ_VARIANTS
    .iter()
    .position(|&t| t == tz)
    .unwrap_or(0) as i32
}

impl From<(i32, i32, i32, i32, i32, i32, i32)> for DateTime {
  fn from(arr: (i32, i32, i32, i32, i32, i32, i32)) -> Self {
    if arr.3 == -1 {
      let d = NaiveDate::from_ymd_opt(arr.0, arr.1 as u32, arr.2 as u32).unwrap_or(NaiveDate::MIN);
      Self::Date(d)
    } else {
      let tz = tz_from_index(arr.6).unwrap_or(chrono_tz::Tz::UTC);
      local_to_datetime(
        arr.0,
        arr.1 as u32,
        arr.2 as u32,
        arr.3 as u32,
        arr.4 as u32,
        arr.5 as u32,
        tz,
      )
      .map(Self::DateTime)
      .unwrap_or_else(|_| {
        Self::DateTime(chrono_tz::UTC.from_utc_datetime(&chrono::NaiveDateTime::MIN))
      })
    }
  }
}

impl From<Int32Array> for DateTime {
  fn from(arr: Int32Array) -> Self {
    (arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6]).into()
  }
}

impl From<&chrono::DateTime<chrono_tz::Tz>> for DateTime {
  fn from(dt: &chrono::DateTime<chrono_tz::Tz>) -> Self {
    Self::DateTime(*dt)
  }
}

impl From<&chrono::DateTime<rrule::Tz>> for DateTime {
  fn from(dt: &chrono::DateTime<rrule::Tz>) -> Self {
    let chrono_tz = match dt.timezone() {
      rrule::Tz::Tz(tz) => tz,
      rrule::Tz::Local(_) => chrono_tz::Tz::UTC,
    };
    Self::DateTime(dt.with_timezone(&chrono_tz))
  }
}

impl From<&DateTime> for Int32Array {
  fn from(val: &DateTime) -> Self {
    let d = val.date();
    let mut arr = vec![d.year(), d.month() as i32, d.day() as i32];
    if let Some(dt) = val.as_datetime() {
      arr.push(dt.hour() as i32);
      arr.push(dt.minute() as i32);
      arr.push(dt.second() as i32);
      arr.push(index_from_tz(dt.timezone()));
    } else {
      arr.push(-1);
      arr.push(-1);
      arr.push(-1);
      arr.push(-1);
    }
    Int32Array::from(arr)
  }
}

impl FromStr for DateTime {
  type Err = String;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    Self::from_str_with_tz(s, chrono_tz::Tz::UTC)
  }
}

impl fmt::Display for DateTime {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      Self::Date(d) => write!(f, "{:04}{:02}{:02}", d.year(), d.month(), d.day()),
      Self::DateTime(dt) => {
        let suffix = if dt.timezone() == chrono_tz::Tz::UTC {
          "Z"
        } else {
          ""
        };
        write!(
          f,
          "{:04}{:02}{:02}T{:02}{:02}{:02}{}",
          dt.year(),
          dt.month(),
          dt.day(),
          dt.hour(),
          dt.minute(),
          dt.second(),
          suffix
        )
      }
    }
  }
}
