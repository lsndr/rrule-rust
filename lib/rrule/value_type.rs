use std::{fmt, str::FromStr};

#[derive(Clone, Debug, PartialEq)]
pub enum ValueType {
  Date,
  DateTime,
}

impl FromStr for ValueType {
  type Err = String;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    match s.to_uppercase().as_str() {
      "DATE" => Ok(ValueType::Date),
      "DATE-TIME" => Ok(ValueType::DateTime),
      _ => Err(format!("Invalid value type: {}", s)),
    }
  }
}

impl fmt::Display for ValueType {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    let str = match self {
      ValueType::Date => "DATE",
      ValueType::DateTime => "DATE-TIME",
    };

    write!(f, "{}", str)
  }
}
