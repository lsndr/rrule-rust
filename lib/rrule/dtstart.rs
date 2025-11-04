use super::datetime::DateTime;
use crate::{
  rrule::value_type::ValueType,
  serialization::{parameters::Parameters, property},
};

#[derive(Clone)]
pub struct DtStart {
  value: DateTime,
  tzid: Option<chrono_tz::Tz>,
  value_type: Option<ValueType>,
}

impl DtStart {
  pub fn value(&self) -> &DateTime {
    &self.value
  }

  pub fn value_type(&self) -> &Option<ValueType> {
    &self.value_type
  }

  pub fn tzid(&self) -> Option<&chrono_tz::Tz> {
    self.tzid.as_ref()
  }

  pub fn derive_timezone(&self) -> chrono_tz::Tz {
    match self.tzid {
      Some(tz) => tz,
      None => chrono_tz::Tz::UTC,
    }
  }

  pub fn derive_value_type(&self) -> ValueType {
    match self.value_type() {
      Some(vt) => vt.clone(),
      None => self.value.derive_value_type(),
    }
  }

  pub fn to_datetime(&self) -> Result<chrono::DateTime<chrono_tz::Tz>, String> {
    self.value.to_datetime(&self.derive_timezone())
  }

  pub fn to_property(&self) -> property::Property {
    let mut parameters = Parameters::new();

    if let Some(tzid) = self.tzid {
      parameters.insert("TZID".to_string(), tzid.to_string());
    }

    if let Some(value) = &self.value_type {
      parameters.insert("VALUE".to_string(), value.to_string());
    }

    let value: String = self.value.to_string();

    property::Property::new(
      "DTSTART".to_string(),
      parameters,
      property::Value::Single(value),
    )
  }

  pub fn new(
    value: DateTime,
    tzid: Option<chrono_tz::Tz>,
    value_type: Option<ValueType>,
  ) -> Result<Self, String> {
    if let Some(time) = &value.time {
      if !time.utc && tzid.is_none() {
        return Err("TZID is requred for non-UTC DTSTART".to_string());
      }
    }

    if let Some(vt) = &value_type {
      if vt != &value.derive_value_type() {
        return Err("DTSTART value and value type do not match".to_string());
      }
    }

    Ok(Self {
      value,
      tzid,
      value_type,
    })
  }

  pub fn from_property(property: property::Property) -> Result<Self, String> {
    let value = match property.value() {
      property::Value::Single(value) => value,
      _ => return Err("Invalid DTSTART value".to_string()),
    };
    let value: DateTime = value.parse()?;

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

    Self::new(value, tzid, value_type)
  }
}

impl TryFrom<property::Property> for DtStart {
  type Error = String;

  fn try_from(property: property::Property) -> Result<Self, Self::Error> {
    DtStart::from_property(property)
  }
}
