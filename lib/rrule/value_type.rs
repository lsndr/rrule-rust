use std::str::FromStr;

#[derive(Clone, Debug, PartialEq)]
pub enum ValueType {
  Date,
  DateTime,
}

impl ToString for ValueType {
  fn to_string(&self) -> String {
    match self {
      ValueType::Date => "DATE".to_string(),
      ValueType::DateTime => "DATE-TIME".to_string(),
    }
  }
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
