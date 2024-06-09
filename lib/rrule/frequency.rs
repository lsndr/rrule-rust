use std::str::FromStr;

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
  pub fn to_string(&self) -> String {
    match self {
      Frequency::Yearly => "YEARLY".to_string(),
      Frequency::Monthly => "MONTHLY".to_string(),
      Frequency::Weekly => "WEEKLY".to_string(),
      Frequency::Daily => "DAILY".to_string(),
      Frequency::Hourly => "HOURLY".to_string(),
      Frequency::Minutely => "MINUTELY".to_string(),
      Frequency::Secondly => "SECONDLY".to_string(),
    }
  }

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

impl Into<rrule::Frequency> for Frequency {
  fn into(self) -> rrule::Frequency {
    (&self).into()
  }
}

impl Into<rrule::Frequency> for &Frequency {
  fn into(self) -> rrule::Frequency {
    match self {
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

impl Into<String> for Frequency {
  fn into(self) -> String {
    self.to_string()
  }
}

impl FromStr for Frequency {
  type Err = String;

  fn from_str(str: &str) -> Result<Self, Self::Err> {
    Self::from_str(str)
  }
}
