use indexmap::IndexMap;

use crate::serialization::to_vec::ToVec;
use std::str::FromStr;

use super::{Parameters, Properties, Property};
use crate::js::{DateTime, RRule, RRuleSet};

impl FromStr for RRuleSet {
  type Err = napi::Error;

  fn from_str(str: &str) -> Result<Self, Self::Err> {
    let properties =
      Properties::from_str(str).map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    let mut dtstart: Option<(i64, String)> = None;
    let mut rrules: Vec<RRule> = Vec::new();
    let mut exrules: Vec<RRule> = Vec::new();
    let mut exdates: Vec<i64> = Vec::new();
    let mut rdates: Vec<i64> = Vec::new();

    for property in properties {
      match property.name() {
        "DTSTART" => {
          let (datetime, tzid) = property_to_dtstart(&property)
            .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;
          dtstart = Some((datetime, tzid));
        }
        "RRULE" => {
          let rrule = RRule::try_from(property)?;
          rrules.push(rrule);
        }
        "EXRULE" => {
          let rrule = RRule::try_from(property)?;
          exrules.push(rrule);
        }
        "EXDATE" => {
          if let Some(value) = property.parameters().get("VALUE") {
            if value == "DATE" {
              return Err(napi::Error::new(
                napi::Status::GenericFailure,
                "Unsupported EXDATE value: DATE",
              ));
            } else if value != "DATE-TIME" {
              return Err(napi::Error::new(
                napi::Status::GenericFailure,
                format!("Unsupported EXDATE value: {}", value),
              ));
            }
          }

          let value = match property.value() {
            Parameters::Single(value) => value,
            Parameters::Multiple(_) => {
              return Err(napi::Error::new(
                napi::Status::GenericFailure,
                "Invalid EXDATE",
              ));
            }
          };

          let dates: Vec<DateTime> = value.as_str().to_vec()?;

          for date in dates {
            exdates.push(date.into());
          }
        }
        "RDATE" => {
          if let Some(value) = property.parameters().get("VALUE") {
            if value == "DATE" {
              return Err(napi::Error::new(
                napi::Status::GenericFailure,
                "Unsupported RDATE value: DATE. Only DATE-TIME is supported",
              ));
            } else if value != "DATE-TIME" {
              return Err(napi::Error::new(
                napi::Status::GenericFailure,
                format!("Unsupported RDATE value: {}", value),
              ));
            }
          }

          let value = match property.value() {
            Parameters::Single(value) => value,
            Parameters::Multiple(_) => {
              return Err(napi::Error::new(
                napi::Status::GenericFailure,
                "Invalid RDATE",
              ));
            }
          };

          let dates: Vec<DateTime> = value.as_str().to_vec()?;

          for date in dates {
            rdates.push(date.into());
          }
        }
        _ => {
          // Ignore unsupported properties
        }
      }
    }

    let (dtstart, tzid) = match dtstart {
      Some(value) => value,
      None => {
        return Err(napi::Error::new(
          napi::Status::GenericFailure,
          "DTSTART is required",
        ));
      }
    };

    return Self::create(
      dtstart,
      tzid,
      Some(rrules.iter().collect()),
      Some(exrules.iter().collect()),
      Some(exdates),
      Some(rdates),
    );
  }
}

impl Into<String> for &RRuleSet {
  fn into(self) -> String {
    let mut properties = Properties::new();
    let mut dtstart_parameters: IndexMap<String, String> = IndexMap::new();
    dtstart_parameters.insert("TZID".to_string(), self.tzid());

    let dtstart_value: String = DateTime::from(self.dtstart()).into();

    properties.push(Property::new(
      "DTSTART".to_string(),
      dtstart_parameters,
      Parameters::Single(dtstart_value),
    ));

    for rrule in self.rrules().iter() {
      properties.push(rrule.into());
    }

    for exrule in self.exrules().iter() {
      properties.push(exrule.into());
    }

    if !self.exdates().is_empty() {
      properties.push(Property::new(
        "EXDATE".to_string(),
        IndexMap::new(),
        Parameters::Single(self.exdates().iter().map(|date| date.to_string()).collect()),
      ));
    }

    if !self.rdates().is_empty() {
      properties.push(Property::new(
        "RDATE".to_string(),
        IndexMap::new(),
        Parameters::Single(self.rdates().iter().map(|date| date.to_string()).collect()),
      ));
    }

    properties.to_string()
  }
}

fn property_to_dtstart(property: &Property) -> Result<(i64, String), String> {
  let datetime = match property.value() {
    Parameters::Single(value) => value,
    Parameters::Multiple(_) => return Err("Invalid DTSTART value".to_string()),
  };
  let datetime: DateTime = datetime.parse()?;

  let tzid = match property.parameters().get("TZID") {
    Some(value) => value.to_string(),
    None => {
      if datetime.utc() {
        "UTC".to_string()
      } else {
        return Err("TZID is requred for non-UTC DTSTART".to_string());
      }
    }
  };
  let datetime: i64 = datetime.into();

  Ok((datetime, tzid))
}
