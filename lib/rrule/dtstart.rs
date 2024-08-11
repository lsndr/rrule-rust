use super::datetime::DateTime;
use crate::serialization::{
  parameters::Parameters,
  property::{Property, Value},
};

#[derive(Clone)]
pub struct DtStart {
  datetime: DateTime,
  tzid: Option<chrono_tz::Tz>,
}

impl DtStart {
  pub fn datetime(&self) -> &DateTime {
    &self.datetime
  }

  pub fn tzid(&self) -> Option<&chrono_tz::Tz> {
    self.tzid.as_ref()
  }

  pub fn timezone(&self) -> chrono_tz::Tz {
    match self.tzid {
      Some(tz) => tz.clone(),
      None => chrono_tz::Tz::UTC,
    }
  }

  pub fn to_datetime(&self) -> Result<chrono::DateTime<chrono_tz::Tz>, String> {
    self.datetime.to_datetime(&self.timezone())
  }

  pub fn to_property(&self) -> Property {
    let mut parameters = Parameters::new();

    if let Some(tzid) = self.tzid {
      parameters.insert("TZID".to_string(), tzid.to_string());
    }

    let value: String = self.datetime.to_string();

    Property::new("DTSTART".to_string(), parameters, Value::Single(value))
  }

  pub fn new(datetime: DateTime, tzid: Option<chrono_tz::Tz>) -> Result<Self, String> {
    if !datetime.utc() && tzid.is_none() {
      return Err("TZID is requred for non-UTC DTSTART".to_string());
    }

    Ok(Self { datetime, tzid })
  }

  pub fn from_property(property: Property) -> Result<Self, String> {
    let datetime = match property.value() {
      Value::Single(value) => value,
      _ => return Err("Invalid DTSTART value".to_string()),
    };
    let datetime: DateTime = datetime.parse()?;

    let tzid = match property.parameters().get("TZID") {
      Some(value) => {
        let tz: chrono_tz::Tz = value
          .parse()
          .map_err(|_| format!("Invalid timezone: {}", value))?;

        Some(tz)
      }
      None => None,
    };

    Ok(Self { datetime, tzid })
  }
}

impl TryFrom<Property> for DtStart {
  type Error = String;

  fn try_from(property: Property) -> Result<Self, Self::Error> {
    DtStart::from_property(property)
  }
}
