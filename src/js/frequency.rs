#[napi(js_name = "Frequency")]
pub enum Frequency {
  Yearly,
  Monthly,
  Weekly,
  Daily,
  Hourly,
  Minutely,
  Secondly,
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
