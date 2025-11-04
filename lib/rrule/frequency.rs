use std::{fmt, str::FromStr};

#[derive(Clone)]
pub enum Frequency {
  Yearly,
  Monthly,
  Weekly,
  Daily,
  Hourly,
  Minutely,
  Secondly,
}

impl Frequency {
  pub fn from_str(str: &str) -> Result<Self, String> {
    let str = str.to_uppercase();
    let str = str.as_str();

    match str {
      "DAILY" => Ok(Frequency::Daily),
      "HOURLY" => Ok(Frequency::Hourly),
      "MINUTELY" => Ok(Frequency::Minutely),
      "MONTHLY" => Ok(Frequency::Monthly),
      "SECONDLY" => Ok(Frequency::Secondly),
      "WEEKLY" => Ok(Frequency::Weekly),
      "YEARLY" => Ok(Frequency::Yearly),
      _ => Err(format!("Invalid frequency: {}", str)),
    }
  }
}

impl From<rrule::Frequency> for Frequency {
  fn from(freq: rrule::Frequency) -> Self {
    match freq {
      rrule::Frequency::Daily => Frequency::Daily,
      rrule::Frequency::Hourly => Frequency::Hourly,
      rrule::Frequency::Minutely => Frequency::Minutely,
      rrule::Frequency::Monthly => Frequency::Monthly,
      rrule::Frequency::Secondly => Frequency::Secondly,
      rrule::Frequency::Weekly => Frequency::Weekly,
      rrule::Frequency::Yearly => Frequency::Yearly,
    }
  }
}

impl From<Frequency> for rrule::Frequency {
  fn from(val: Frequency) -> Self {
    (&val).into()
  }
}

impl From<&Frequency> for rrule::Frequency {
  fn from(val: &Frequency) -> Self {
    match val {
      Frequency::Daily => rrule::Frequency::Daily,
      Frequency::Hourly => rrule::Frequency::Hourly,
      Frequency::Minutely => rrule::Frequency::Minutely,
      Frequency::Monthly => rrule::Frequency::Monthly,
      Frequency::Secondly => rrule::Frequency::Secondly,
      Frequency::Weekly => rrule::Frequency::Weekly,
      Frequency::Yearly => rrule::Frequency::Yearly,
    }
  }
}

impl From<Frequency> for String {
  fn from(val: Frequency) -> Self {
    val.to_string()
  }
}

impl FromStr for Frequency {
  type Err = String;

  fn from_str(str: &str) -> Result<Self, Self::Err> {
    Self::from_str(str)
  }
}

impl fmt::Display for Frequency {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    let str = match self {
      Frequency::Yearly => "YEARLY",
      Frequency::Monthly => "MONTHLY",
      Frequency::Weekly => "WEEKLY",
      Frequency::Daily => "DAILY",
      Frequency::Hourly => "HOURLY",
      Frequency::Minutely => "MINUTELY",
      Frequency::Secondly => "SECONDLY",
    };

    write!(f, "{}", str)
  }
}
