use std::str::FromStr;

use napi_derive::napi;

#[napi(js_name = "Month")]
pub enum Month {
  January,
  February,
  March,
  April,
  May,
  June,
  July,
  August,
  September,
  October,
  November,
  December,
}

impl FromStr for Month {
  type Err = String;

  fn from_str(month: &str) -> Result<Self, Self::Err> {
    match month {
      "1" => Ok(Month::January),
      "2" => Ok(Month::February),
      "3" => Ok(Month::March),
      "4" => Ok(Month::April),
      "5" => Ok(Month::May),
      "6" => Ok(Month::June),
      "7" => Ok(Month::July),
      "8" => Ok(Month::August),
      "9" => Ok(Month::September),
      "10" => Ok(Month::October),
      "11" => Ok(Month::November),
      "12" => Ok(Month::December),
      _ => Err(format!("Unknown month number: {}", month)),
    }
  }
}

impl From<&u8> for Month {
  fn from(month: &u8) -> Self {
    match month {
      0 => Month::January,
      1 => Month::February,
      2 => Month::March,
      3 => Month::April,
      4 => Month::May,
      5 => Month::June,
      6 => Month::July,
      7 => Month::August,
      8 => Month::September,
      9 => Month::October,
      10 => Month::November,
      11 => Month::December,
      _ => panic!("Unknown month index: {}", month),
    }
  }
}

impl Into<chrono::Month> for Month {
  fn into(self) -> chrono::Month {
    match self {
      Month::January => chrono::Month::January,
      Month::February => chrono::Month::February,
      Month::March => chrono::Month::March,
      Month::April => chrono::Month::April,
      Month::May => chrono::Month::May,
      Month::June => chrono::Month::June,
      Month::July => chrono::Month::July,
      Month::August => chrono::Month::August,
      Month::September => chrono::Month::September,
      Month::October => chrono::Month::October,
      Month::November => chrono::Month::November,
      Month::December => chrono::Month::December,
    }
  }
}
