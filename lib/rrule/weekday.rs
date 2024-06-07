use std::str::FromStr;

#[derive(PartialEq, Clone)]
pub enum Weekday {
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday,
}

impl Default for &Weekday {
  fn default() -> Self {
    &Weekday::Monday
  }
}

impl Default for Weekday {
  fn default() -> Self {
    Weekday::Monday
  }
}

impl From<rrule::Weekday> for Weekday {
  fn from(weekday: rrule::Weekday) -> Self {
    match weekday {
      rrule::Weekday::Mon => Weekday::Monday,
      rrule::Weekday::Tue => Weekday::Tuesday,
      rrule::Weekday::Wed => Weekday::Wednesday,
      rrule::Weekday::Thu => Weekday::Thursday,
      rrule::Weekday::Fri => Weekday::Friday,
      rrule::Weekday::Sat => Weekday::Saturday,
      rrule::Weekday::Sun => Weekday::Sunday,
    }
  }
}

impl Into<rrule::Weekday> for &Weekday {
  fn into(self) -> rrule::Weekday {
    match self {
      Weekday::Monday => rrule::Weekday::Mon,
      Weekday::Tuesday => rrule::Weekday::Tue,
      Weekday::Wednesday => rrule::Weekday::Wed,
      Weekday::Thursday => rrule::Weekday::Thu,
      Weekday::Friday => rrule::Weekday::Fri,
      Weekday::Saturday => rrule::Weekday::Sat,
      Weekday::Sunday => rrule::Weekday::Sun,
    }
  }
}

impl Into<rrule::Weekday> for Weekday {
  fn into(self) -> rrule::Weekday {
    (&self).into()
  }
}

impl Into<String> for &Weekday {
  fn into(self) -> String {
    match self {
      Weekday::Monday => "MO".to_string(),
      Weekday::Tuesday => "TU".to_string(),
      Weekday::Wednesday => "WE".to_string(),
      Weekday::Thursday => "TH".to_string(),
      Weekday::Friday => "FR".to_string(),
      Weekday::Saturday => "SA".to_string(),
      Weekday::Sunday => "SU".to_string(),
    }
  }
}

impl FromStr for Weekday {
  type Err = String;

  fn from_str(str: &str) -> Result<Self, Self::Err> {
    match &*str.to_uppercase() {
      "MO" => Ok(Weekday::Monday),
      "TU" => Ok(Weekday::Tuesday),
      "WE" => Ok(Weekday::Wednesday),
      "TH" => Ok(Weekday::Thursday),
      "FR" => Ok(Weekday::Friday),
      "SA" => Ok(Weekday::Saturday),
      "SU" => Ok(Weekday::Sunday),
      _ => Err(format!("Invalid weekday: {}", str)),
    }
  }
}
