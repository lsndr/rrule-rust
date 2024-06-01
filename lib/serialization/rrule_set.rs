use indexmap::IndexMap;

use crate::serialization::to_vec::ToVec;
use std::str::FromStr;

use super::{Calendar, Parameters, Properties, Property};
use crate::js::{DateTime, RRule, RRuleSet};

impl FromStr for RRuleSet {
  type Err = napi::Error;

  fn from_str(str: &str) -> Result<Self, Self::Err> {
    let mut dtstart: Option<(i64, String)> = None;
    let mut rrules: Vec<RRule> = Vec::new();
    let mut exrules: Vec<RRule> = Vec::new();
    let mut exdates: Vec<i64> = Vec::new();
    let mut rdates: Vec<i64> = Vec::new();

    let calendar = Calendar::from_str(str)?;
    let (calendar_dtstarts, calendar_rrules, calendar_exrules, calendar_exdates, calendar_rdates) =
      calendar.into();

    if calendar_dtstarts.len() > 1 {
      return Err(napi::Error::new(
        napi::Status::GenericFailure,
        "Only one DTSTART is allowed",
      ));
    }

    dtstart = calendar_dtstarts
      .first()
      .and_then(|item| Some(item.clone()));

    let (dtstart, tzid) = match dtstart {
      Some(value) => value,
      None => {
        return Err(napi::Error::new(
          napi::Status::GenericFailure,
          "DTSTART is required",
        ));
      }
    };

    for rrule in calendar_rrules {
      rrules.push(rrule);
    }

    for exrule in calendar_exrules {
      exrules.push(exrule);
    }

    for exdate in calendar_exdates {
      exdates.push(exdate);
    }

    for rdate in calendar_rdates {
      rdates.push(rdate);
    }

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
        Parameters::Single(
          self
            .exdates()
            .into_iter()
            .map(|date| {
              let date: DateTime = date.into();
              let date: String = date.into();

              date
            })
            .collect(),
        ),
      ));
    }

    if !self.rdates().is_empty() {
      properties.push(Property::new(
        "RDATE".to_string(),
        IndexMap::new(),
        Parameters::Single(
          self
            .rdates()
            .into_iter()
            .map(|date| {
              let date: DateTime = date.into();
              let date: String = date.into();

              date
            })
            .collect(),
        ),
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
