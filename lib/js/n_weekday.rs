use std::str::FromStr;

use super::weekday::Weekday;
use napi_derive::napi;

#[napi(object, js_name = "NWeekday")]
pub struct NWeekday {
  /// If set, this represents the nth occurrence of the weekday.
  /// Otherwise it represents every occurrence of the weekday.
  ///
  /// A negative value represents nth occurrence from the end.
  pub n: Option<i16>,
  pub weekday: Weekday,
}

impl From<rrule::NWeekday> for NWeekday {
  fn from(nday: rrule::NWeekday) -> Self {
    match nday {
      rrule::NWeekday::Every(weekday) => NWeekday {
        n: None,
        weekday: Weekday::from(weekday),
      },
      rrule::NWeekday::Nth(n, weekday) => NWeekday {
        n: Some(n),
        weekday: weekday.into(),
      },
    }
  }
}

impl Into<rrule::NWeekday> for NWeekday {
  fn into(self) -> rrule::NWeekday {
    match self.n {
      Some(n) => rrule::NWeekday::Nth(n, self.weekday.into()),
      None => rrule::NWeekday::Every(self.weekday.into()),
    }
  }
}

impl Into<String> for &NWeekday {
  fn into(self) -> String {
    match self.n {
      Some(n) => {
        let n = if n > 1 || n < 0 {
          n.to_string()
        } else {
          "".to_string()
        };
        let weekday: String = self.weekday.into();

        format!("{}{}", n, weekday)
      }
      None => self.weekday.into(),
    }
  }
}

impl FromStr for NWeekday {
  type Err = String;

  fn from_str(str: &str) -> Result<Self, Self::Err> {
    let weekday = extract_weekday(str)?;
    let n = if str.len() > 2 {
      Some(extract_number(str)?)
    } else {
      None
    };

    Ok(NWeekday { n, weekday })
  }
}

fn extract_weekday(str: &str) -> Result<Weekday, String> {
  let weekday = str
    .chars()
    .rev()
    .take(2)
    .collect::<String>()
    .chars()
    .rev()
    .collect::<String>();

  weekday.parse()
}

fn extract_number(str: &str) -> Result<i16, String> {
  let number = str
    .chars()
    .take_while(|c| c.is_digit(10) || *c == '-')
    .collect::<String>();

  number
    .parse()
    .map_err(|_| format!("Invalid number: {}", number))
}
