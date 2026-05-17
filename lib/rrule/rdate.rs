use super::{datetime::DateTime, dtstart::DtStart};
use crate::{
  rrule::value_type::ValueType,
  serialization::{
    parameters::Parameters,
    property::{Property, Value},
  },
};

#[derive(Clone)]
pub struct RDate {
  values: Vec<DateTime>,
  value_type: Option<ValueType>,
}

impl RDate {
  pub fn new(
    datetimes: Vec<DateTime>,
    value_type: Option<ValueType>,
  ) -> Result<Self, String> {
    let expected_value_type = match &value_type {
      Some(vt) => Some(vt.clone()),
      None => {
        if datetimes.is_empty() {
          None
        } else {
          Some(datetimes[0].derive_value_type())
        }
      }
    };

    if let Some(vt) = &expected_value_type {
      for dt in &datetimes {
        if &dt.derive_value_type() != vt {
          return Err(
            "All RDATE instances must have the same value type as specified in RDATE".to_string(),
          );
        }
      }
    }

    Ok(Self {
      values: datetimes,
      value_type,
    })
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
      .map(|datetime| datetime.to_datetime(tzid))
      .collect()
  }

  pub fn to_property(&self) -> Property {
    let mut parameters = Parameters::new();

    let emit_tzid = self.values.iter().find_map(|dt| {
      if let DateTime::DateTime(dt) = dt {
        let tz = dt.timezone();
        if tz != chrono_tz::Tz::UTC {
          Some(tz)
        } else {
          None
        }
      } else {
        None
      }
    });

    if let Some(tzid) = emit_tzid {
      parameters.insert("TZID".to_string(), tzid.to_string());
    }

    let value: String = self
      .values
      .iter()
      .map(|datetime| datetime.to_string())
      .collect::<Vec<String>>()
      .join(",");

    if let Some(value) = &self.value_type {
      parameters.insert("VALUE".to_string(), value.to_string());
    }

    Property::new("RDATE".to_string(), parameters, Value::Single(value))
  }

  pub fn from_property(property: Property) -> Result<Self, String> {
    let fallback = match property.parameters().get("TZID") {
      Some(value) => value
        .parse()
        .map_err(|_| format!("Invalid timezone: {}", value))?,
      None => chrono_tz::Tz::UTC,
    };

    let datetimes_str = match property.value() {
      Value::Single(value) => value.as_str(),
      _ => return Err("Invalid RDATE value".to_string()),
    };
    let datetimes = datetimes_str
      .split(',')
      .map(|date| DateTime::from_str_with_tz(date, fallback))
      .collect::<Result<Vec<DateTime>, String>>()?;

    let value_type = match property.parameters().get("VALUE") {
      Some(value) => {
        let value: ValueType = value
          .parse()
          .map_err(|_| format!("Invalid value: {}", value))?;

        Some(value)
      }
      None => None,
    };

    Self::new(datetimes, value_type)
  }
}

impl TryFrom<Property> for RDate {
  type Error = String;

  fn try_from(property: Property) -> Result<Self, Self::Error> {
    RDate::from_property(property)
  }
}
