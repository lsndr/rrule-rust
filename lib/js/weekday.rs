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

impl Into<rrule::Weekday> for Weekday {
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
