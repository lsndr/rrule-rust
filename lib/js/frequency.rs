use crate::rrule::frequency;
use napi_derive::napi;

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

impl Into<frequency::Frequency> for Frequency {
  fn into(self) -> frequency::Frequency {
    match self {
      Frequency::Yearly => frequency::Frequency::Yearly,
      Frequency::Monthly => frequency::Frequency::Monthly,
      Frequency::Weekly => frequency::Frequency::Weekly,
      Frequency::Daily => frequency::Frequency::Daily,
      Frequency::Hourly => frequency::Frequency::Hourly,
      Frequency::Minutely => frequency::Frequency::Minutely,
      Frequency::Secondly => frequency::Frequency::Secondly,
    }
  }
}

impl From<&frequency::Frequency> for Frequency {
  fn from(frequency: &frequency::Frequency) -> Self {
    match frequency {
      frequency::Frequency::Yearly => Frequency::Yearly,
      frequency::Frequency::Monthly => Frequency::Monthly,
      frequency::Frequency::Weekly => Frequency::Weekly,
      frequency::Frequency::Daily => Frequency::Daily,
      frequency::Frequency::Hourly => Frequency::Hourly,
      frequency::Frequency::Minutely => Frequency::Minutely,
      frequency::Frequency::Secondly => Frequency::Secondly,
    }
  }
}
