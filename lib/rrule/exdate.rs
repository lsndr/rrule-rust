use super::{datetime::DateTime, dtstart::DtStart};
use crate::{
  rrule::value_type::ValueType,
  serialization::{
    parameters::Parameters,
    property::{Property, Value},
  },
};

#[derive(Clone)]
pub struct ExDate {
  values: Vec<DateTime>,
  tzid: Option<chrono_tz::Tz>,
  value_type: Option<ValueType>,
}

impl ExDate {
  pub fn new(
    datetimes: Vec<DateTime>,
    tzid: Option<chrono_tz::Tz>,
    value_type: Option<ValueType>,
  ) -> Result<Self, String> {
    let expected_value_type = match &value_type {
      Some(vt) => Some(vt.clone()),
      None => {
        if datetimes.is_empty() {
          None
        } else {
          Some(datetimes[0].derive_value_type().clone())
        }
      }
    };

    if let Some(vt) = &expected_value_type {
      for dt in &datetimes {
        if &dt.derive_value_type() != vt {
          return Err(
            "All EXDATE instances must have the same value type as specified in EXDATE".to_string(),
          );
        }
      }
    }

    Ok(Self {
      values: datetimes,
      tzid,
      value_type,
    })
  }

  pub fn tzid(&self) -> &Option<chrono_tz::Tz> {
    &self.tzid
  }

  pub fn values(&self) -> &Vec<DateTime> {
    &self.values
  }

  pub fn value_type(&self) -> &Option<ValueType> {
    &self.value_type
  }

  pub fn derive_value_type(&self) -> Option<ValueType> {
    if self.value_type.is_some() {
      self.value_type.clone()
    } else if self.values.is_empty() {
      None
    } else {
      Some(self.values[0].derive_value_type())
    }
  }

  pub fn derive_timezone(&self) -> chrono_tz::Tz {
    match self.tzid {
      Some(tz) => tz,
      None => chrono_tz::Tz::UTC,
    }
  }

  pub fn to_datetimes(
    &self,
    dtstart: &DtStart,
  ) -> Result<Vec<chrono::DateTime<chrono_tz::Tz>>, String> {
    self.to_datetimes_with_fallback_tzid(dtstart.derive_timezone())
  }

  pub fn to_datetimes_with_fallback_tzid(
    &self,
    tzid: chrono_tz::Tz,
  ) -> Result<Vec<chrono::DateTime<chrono_tz::Tz>>, String> {
    self
      .values
      .iter()
      .map(|datetime| datetime.to_datetime(&self.tzid.unwrap_or(tzid)))
      .collect()
  }

  pub fn to_property(&self) -> Property {
    let mut parameters = Parameters::new();

    if let Some(tzid) = self.tzid {
      parameters.insert("TZID".to_string(), tzid.to_string());
    }

    let value: String = self
      .values
      .iter()
      .map(|datetime| datetime.to_string())
      .collect::<Vec<String>>()
      .join(",");

    if let Some(value) = &self.value_type() {
      parameters.insert("VALUE".to_string(), value.to_string());
    }

    Property::new("EXDATE".to_string(), parameters, Value::Single(value))
  }

  pub fn from_property(property: Property) -> Result<Self, String> {
    let datetimes = match property.value() {
      Value::Single(value) => value,
      _ => return Err("Invalid EXDATE value".to_string()),
    };
    let datetimes = datetimes
      .split(',')
      .map(|date| date.parse::<DateTime>())
      .collect::<Result<Vec<DateTime>, String>>()?;

    let tzid = match property.parameters().get("TZID") {
      Some(value) => {
        let tz: chrono_tz::Tz = value
          .parse()
          .map_err(|_| format!("Invalid timezone: {}", value))?;

        Some(tz)
      }
      None => None,
    };

    let value_type = match property.parameters().get("VALUE") {
      Some(value) => {
        let value: ValueType = value
          .parse()
          .map_err(|_| format!("Invalid value: {}", value))?;

        Some(value)
      }
      None => None,
    };

    Self::new(datetimes, tzid, value_type)
  }
}

impl TryFrom<Property> for ExDate {
  type Error = String;

  fn try_from(property: Property) -> Result<Self, Self::Error> {
    ExDate::from_property(property)
  }
}
