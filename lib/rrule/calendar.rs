use crate::serialization::properties::Properties;
use std::str::FromStr;

use super::{dtstart::DtStart, exdate::ExDate, rdate::RDate, rrule::RRule};

pub struct Calendar {
  dtstarts: Vec<DtStart>,
  rrules: Vec<RRule>,
  exrules: Vec<RRule>,
  exdates: Vec<ExDate>,
  rdates: Vec<RDate>,
}

impl
  Into<(
    Vec<DtStart>,
    Vec<RRule>,
    Vec<RRule>,
    Vec<ExDate>,
    Vec<RDate>,
  )> for Calendar
{
  fn into(
    self,
  ) -> (
    Vec<DtStart>,
    Vec<RRule>,
    Vec<RRule>,
    Vec<ExDate>,
    Vec<RDate>,
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
    let mut rdates: Vec<RDate> = Vec::new();

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
          rdates.push(RDate::from_property(property)?);
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
