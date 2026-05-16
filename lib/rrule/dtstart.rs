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
    if let Some(tz) = self.tzid {
      return tz;
    }
    match self.value {
      DateTime::DateTime(dt) => dt.timezone(),
      DateTime::Date(_) => chrono_tz::Tz::UTC,
    }
  }

  pub fn derive_value_type(&self) -> ValueType {
    match self.value_type() {
      Some(vt) => vt.clone(),
      None => self.value.derive_value_type(),
    }
  }

  pub fn to_datetime(&self) -> Result<chrono::DateTime<chrono_tz::Tz>, String> {
    self.value.to_datetime(self.derive_timezone())
  }

  pub fn to_property(&self) -> property::Property {
    let mut parameters = Parameters::new();

    let emit_tzid = self.tzid.or_else(|| {
      if let DateTime::DateTime(dt) = self.value {
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
    let tzid: Option<chrono_tz::Tz> = match property.parameters().get("TZID") {
      Some(value) => Some(
        value
          .parse()
          .map_err(|_| format!("Invalid timezone: {}", value))?,
      ),
      None => None,
    };

    let fallback = tzid.unwrap_or(chrono_tz::Tz::UTC);

    let value_str = match property.value() {
      property::Value::Single(value) => value.as_str(),
      _ => return Err("Invalid DTSTART value".to_string()),
    };
    let value = DateTime::from_str_with_tz(value_str, fallback)?;

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
