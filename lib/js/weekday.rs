use crate::rrule::weekday;
use napi_derive::napi;

#[napi(js_name = "Weekday")]
pub enum Weekday {
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday,
}

impl Into<weekday::Weekday> for Weekday {
  fn into(self) -> weekday::Weekday {
    match self {
      Weekday::Monday => weekday::Weekday::Monday,
      Weekday::Tuesday => weekday::Weekday::Tuesday,
      Weekday::Wednesday => weekday::Weekday::Wednesday,
      Weekday::Thursday => weekday::Weekday::Thursday,
      Weekday::Friday => weekday::Weekday::Friday,
      Weekday::Saturday => weekday::Weekday::Saturday,
      Weekday::Sunday => weekday::Weekday::Sunday,
    }
  }
}

impl From<&weekday::Weekday> for Weekday {
  fn from(weekday: &weekday::Weekday) -> Self {
    match weekday {
      weekday::Weekday::Monday => Weekday::Monday,
      weekday::Weekday::Tuesday => Weekday::Tuesday,
      weekday::Weekday::Wednesday => Weekday::Wednesday,
      weekday::Weekday::Thursday => Weekday::Thursday,
      weekday::Weekday::Friday => Weekday::Friday,
      weekday::Weekday::Saturday => Weekday::Saturday,
      weekday::Weekday::Sunday => Weekday::Sunday,
    }
  }
}
