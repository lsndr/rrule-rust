use super::{datetime::DateTime, dtstart::DtStart};
use crate::serialization::{
  parameters::Parameters,
  property::{Property, Value},
};

#[derive(Clone)]
pub struct ExDate {
  datetimes: Vec<DateTime>,
  tzid: Option<chrono_tz::Tz>,
}

impl ExDate {
  pub fn to_datetimes(
    &self,
    dtstart: &DtStart,
  ) -> Result<Vec<chrono::DateTime<chrono_tz::Tz>>, String> {
    self
      .datetimes
      .iter()
      .map(|datetime| datetime.to_datetime(&self.tzid.unwrap_or(dtstart.timezone())))
      .collect()
  }

  pub fn to_property(&self) -> Property {
    let mut parameters = Parameters::new();

    if let Some(tzid) = self.tzid {
      // UTC datetimes MUST NOT contain a TZID
      if tzid != chrono_tz::Tz::UTC {
        parameters.insert("TZID".to_string(), tzid.to_string());
      }
    }

    let value: String = self
      .datetimes
      .iter()
      .map(|datetime| datetime.to_string())
      .collect::<Vec<String>>()
      .join(",");

    Property::new("EXDATE".to_string(), parameters, Value::Single(value))
  }

  pub fn from_property(property: Property) -> Result<Self, String> {
    let datetimes = match property.value() {
      Value::Single(value) => value,
      _ => return Err("Invalid EXDATE value".to_string()),
    };
    let datetimes: Result<Vec<DateTime>, String> = datetimes
      .split(',')
      .map(|date| date.parse::<DateTime>())
      .collect();

    let tzid = match property.parameters().get("TZID") {
      Some(value) => {
        let tz: chrono_tz::Tz = value
          .parse()
          .map_err(|_| format!("Invalid timezone: {}", value))?;

        Some(tz)
      }
      None => None,
    };

    Ok(Self {
      datetimes: datetimes?,
      tzid,
    })
  }
}

impl TryFrom<Property> for ExDate {
  type Error = String;

  fn try_from(property: Property) -> Result<Self, Self::Error> {
    ExDate::from_property(property)
  }
}

impl From<i64> for ExDate {
  fn from(numeric: i64) -> Self {
    let datetime: DateTime = numeric.into();

    ExDate {
      datetimes: vec![datetime],
      tzid: None,
    }
  }
}
