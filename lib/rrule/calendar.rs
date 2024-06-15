use crate::serialization::{
  properties::Properties,
  property::{Property, Value},
};
use std::str::FromStr;

use super::{datetime::DateTime, dtstart::DtStart, exdate::ExDate, rrule::RRule};

pub struct Calendar {
  dtstarts: Vec<DtStart>,
  rrules: Vec<RRule>,
  exrules: Vec<RRule>,
  exdates: Vec<ExDate>,
  rdates: Vec<DateTime>,
}

impl
  Into<(
    Vec<DtStart>,
    Vec<RRule>,
    Vec<RRule>,
    Vec<ExDate>,
    Vec<DateTime>,
  )> for Calendar
{
  fn into(
    self,
  ) -> (
    Vec<DtStart>,
    Vec<RRule>,
    Vec<RRule>,
    Vec<ExDate>,
    Vec<DateTime>,
  ) {
    (
      self.dtstarts,
      self.rrules,
      self.exrules,
      self.exdates,
      self.rdates,
    )
  }
}

impl FromStr for Calendar {
  type Err = String;

  fn from_str(str: &str) -> Result<Self, Self::Err> {
    let properties: Properties = str.parse().map_err(|e| format!("{}", e))?;

    let mut dtstarts: Vec<DtStart> = Vec::new();
    let mut rrules: Vec<RRule> = Vec::new();
    let mut exrules: Vec<RRule> = Vec::new();
    let mut exdates: Vec<ExDate> = Vec::new();
    let mut rdates: Vec<DateTime> = Vec::new();

    for property in properties {
      match property.name() {
        "DTSTART" => {
          dtstarts.push(property.try_into()?);
        }
        "RRULE" => {
          rrules.push(property.try_into()?);
        }
        "EXRULE" => {
          exrules.push(property.try_into()?);
        }
        "EXDATE" => {
          exdates.push(ExDate::from_property(property)?);
        }
        "RDATE" => {
          rdates.extend(parse_datetimes_property("EXDATE", property)?);
        }
        _ => {
          // Ignore unsupported properties
        }
      }
    }

    Ok(Calendar {
      dtstarts,
      rrules,
      exrules,
      exdates,
      rdates,
    })
  }
}

fn parse_datetimes_property(key: &str, property: Property) -> Result<Vec<DateTime>, String> {
  if let Some(value) = property.parameters().get("VALUE") {
    if value != "DATE-TIME" {
      return Err(format!(
        "Unsupported {} type: DATE. Only DATE-TIME is supported",
        key
      ));
    }
  }

  let value = match property.value() {
    Value::Single(value) => value,
    Value::Parameters(_) => {
      return Err(format!("Invalid {}", key));
    }
  };

  let dates: Result<Vec<DateTime>, String> = value
    .split(',')
    .map(|date| date.parse::<DateTime>())
    .collect();

  dates
}
