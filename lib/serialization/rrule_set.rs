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
          rrules.push(rrule);
        }
        _ => {
          return Err(napi::Error::new(
            napi::Status::GenericFailure,
            format!("Unsupported property: {}", property.name()),
          ));
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
      None,
      None,
      None,
    );
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
