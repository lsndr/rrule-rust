use super::weekday::Weekday;

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
