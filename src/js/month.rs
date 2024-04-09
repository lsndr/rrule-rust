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
