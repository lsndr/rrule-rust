use super::weekday::Weekday;
use crate::rrule::n_weekday;
use napi_derive::napi;

#[napi(object, js_name = "NWeekday")]
pub struct NWeekday {
  pub n: Option<i16>,
  pub weekday: Weekday,
}

impl Into<n_weekday::NWeekday> for NWeekday {
  fn into(self) -> n_weekday::NWeekday {
    n_weekday::NWeekday {
      n: self.n,
      weekday: self.weekday.into(),
    }
  }
}

impl From<&n_weekday::NWeekday> for NWeekday {
  fn from(n_weekday: &n_weekday::NWeekday) -> Self {
    Self {
      n: n_weekday.n,
      weekday: (&n_weekday.weekday).into(),
    }
  }
}
