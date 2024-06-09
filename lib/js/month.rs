use crate::rrule::month;
use napi_derive::napi;

#[napi(js_name = "Month")]
pub enum Month {
  January = 1,
  February = 2,
  March = 3,
  April = 4,
  May = 5,
  June = 6,
  July = 7,
  August = 8,
  September = 9,
  October = 10,
  November = 11,
  December = 12,
}

impl Into<month::Month> for Month {
  fn into(self) -> month::Month {
    match self {
      Month::January => month::Month::January,
      Month::February => month::Month::February,
      Month::March => month::Month::March,
      Month::April => month::Month::April,
      Month::May => month::Month::May,
      Month::June => month::Month::June,
      Month::July => month::Month::July,
      Month::August => month::Month::August,
      Month::September => month::Month::September,
      Month::October => month::Month::October,
      Month::November => month::Month::November,
      Month::December => month::Month::December,
    }
  }
}

impl From<&month::Month> for Month {
  fn from(month: &month::Month) -> Self {
    match month {
      month::Month::January => Month::January,
      month::Month::February => Month::February,
      month::Month::March => Month::March,
      month::Month::April => Month::April,
      month::Month::May => Month::May,
      month::Month::June => Month::June,
      month::Month::July => Month::July,
      month::Month::August => Month::August,
      month::Month::September => Month::September,
      month::Month::October => Month::October,
      month::Month::November => Month::November,
      month::Month::December => Month::December,
    }
  }
}
