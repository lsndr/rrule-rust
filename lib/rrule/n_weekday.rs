use super::weekday::Weekday;
use std::str::FromStr;

#[derive(Clone)]
pub struct NWeekday {
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

impl From<&NWeekday> for rrule::NWeekday {
  fn from(val: &NWeekday) -> Self {
    match val.n {
      Some(n) => rrule::NWeekday::Nth(n, (&val.weekday).into()),
      None => rrule::NWeekday::Every((&val.weekday).into()),
    }
  }
}

impl From<NWeekday> for rrule::NWeekday {
  fn from(val: NWeekday) -> Self {
    (&val).into()
  }
}

impl From<&NWeekday> for String {
  fn from(val: &NWeekday) -> Self {
    match val.n {
      Some(n) => {
        let weekday: String = (&val.weekday).into();

        format!("{}{}", n, weekday)
      }
      None => (&val.weekday).into(),
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
    .take_while(|c| c.is_ascii_digit() || *c == '-')
    .collect::<String>();

  number
    .parse()
    .map_err(|_| format!("Invalid number: {}", number))
}
