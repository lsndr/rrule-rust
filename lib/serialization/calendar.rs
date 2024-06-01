use super::{Parameters, Properties, Property};
use crate::js::{DateTime, RRule};
use crate::serialization::to_vec::ToVec;
use std::str::FromStr;

pub struct Calendar {
  dtstarts: Vec<(i64, String)>,
  rrules: Vec<RRule>,
  exrules: Vec<RRule>,
  exdates: Vec<i64>,
  rdates: Vec<i64>,
}

impl
  Into<(
    Vec<(i64, String)>,
    Vec<RRule>,
    Vec<RRule>,
    Vec<i64>,
    Vec<i64>,
  )> for Calendar
{
  fn into(
    self,
  ) -> (
    Vec<(i64, String)>,
    Vec<RRule>,
    Vec<RRule>,
    Vec<i64>,
    Vec<i64>,
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
  type Err = napi::Error;

  fn from_str(str: &str) -> Result<Self, Self::Err> {
    let properties =
      Properties::from_str(str).map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    let mut dtstarts: Vec<(i64, String)> = Vec::new();
    let mut rrules: Vec<RRule> = Vec::new();
    let mut exrules: Vec<RRule> = Vec::new();
    let mut exdates: Vec<i64> = Vec::new();
    let mut rdates: Vec<i64> = Vec::new();

    for property in properties {
      match property.name() {
        "DTSTART" => {
          let (datetime, tzid) = property_to_dtstart(&property)
            .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

          dtstarts.push((datetime, tzid));
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
          // ignore unsupported properties
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
