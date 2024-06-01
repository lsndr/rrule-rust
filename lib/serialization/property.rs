use indexmap::IndexMap;
use std::fmt;

pub enum Parameters {
  Single(String),
  Multiple(IndexMap<String, String>),
}

#[derive(Debug)]
pub enum Error {
  InvalidProperty(String),
  InvalidParameter(String),
  InvalidParameters(String),
}

impl fmt::Display for Error {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      Error::InvalidProperty(str) => write!(f, "Invalid property: {}", str),
      Error::InvalidParameter(str) => write!(f, "Invalid parameter: {}", str),
      Error::InvalidParameters(str) => write!(f, "Invalid parameters: {}", str),
    }
  }
}

pub struct Property {
  name: String,
  parameters: IndexMap<String, String>,
  value: Parameters,
}

impl Property {
  pub fn name(&self) -> &str {
    &self.name
  }

  pub fn parameters(&self) -> &IndexMap<String, String> {
    &self.parameters
  }

  pub fn value(&self) -> &Parameters {
    &self.value
  }

  pub fn to_string(&self) -> String {
    let mut string = format!("{}", self.name);

    for (key, value) in self.parameters() {
      string.push_str(&format!(";{}={}", key, value));
    }

    string.push_str(":");

    match &self.value {
      Parameters::Single(value) => string.push_str(value),
      Parameters::Multiple(values) => {
        let mut values = values.iter();

        if let Some((key, value)) = values.next() {
          string.push_str(&format!("{}={}", key, value));

          for (key, value) in values {
            string.push_str(&format!(";{}={}", key, value));
          }
        }
      }
    }

    string
  }

  pub fn new(name: String, parameters: IndexMap<String, String>, value: Parameters) -> Property {
    Property {
      name,
      parameters,
      value,
    }
  }

  pub fn from_string(str: &str) -> Result<Property, Error> {
    let key_value: Vec<&str> = str.trim().split(':').collect();

    if key_value.len() != 2 {
      return Err(Error::InvalidProperty(str.to_string()));
    }

    let (name, parameters) = Self::parse_name(key_value[0].trim())?;
    let value = Self::parse_parameters(key_value[1].trim())?;

    if let Parameters::Single(_) = parameters {
      return Err(Error::InvalidParameters(key_value[0].to_string()));
    }

    match parameters {
      Parameters::Multiple(parameters) => Ok(Property {
        name,
        parameters,
        value,
      }),
      Parameters::Single(_) => Err(Error::InvalidParameters(key_value[0].to_string())),
    }
  }

  fn parse_name(str: &str) -> Result<(String, Parameters), Error> {
    let name_params: Vec<&str> = str.split(';').take(2).collect();

    let name = name_params[0].trim().to_uppercase();
    let params = Self::parse_parameters(name_params.get(1).unwrap_or(&"").trim())?;

    Ok((name, params))
  }

  fn parse_parameters(str: &str) -> Result<Parameters, Error> {
    let mut params = IndexMap::new();
    let param_strings = str.split(';');

    for param_string in param_strings {
      let param_string = param_string.trim();
      let (key, value) = Self::parse_parameter(param_string)?;

      if let Some(name) = key {
        params.insert(name.to_uppercase(), value.to_string());
      } else if params.len() == 0 && param_string.len() > 0 {
        return Ok(Parameters::Single(param_string.to_string()));
      } else if params.len() > 0 {
        return Err(Error::InvalidParameters(str.to_string()));
      }
    }

    Ok(Parameters::Multiple(params))
  }

  fn parse_parameter(str: &str) -> Result<(Option<String>, &str), Error> {
    let key_value: Vec<&str> = str.split('=').collect();

    if key_value.len() == 1 {
      return Ok((None, key_value[0].trim()));
    } else if key_value.len() > 2 {
      return Err(Error::InvalidParameter(str.to_string()));
    }

    Ok((
      Some(key_value[0].trim().to_uppercase()),
      key_value[1].trim(),
    ))
  }
}

#[cfg(test)]
mod tests {
  use super::Property;

  #[test]
  fn test_rrule() {
    let property = Property::from_string("RRULE:FREQ=DAILY;INTERVAL=1").unwrap();

    assert_eq!(property.name(), "RRULE");
    assert_eq!(property.parameters().len(), 0);
    assert!(matches!(property.value(), super::Parameters::Multiple(params) if params.len() == 2));
    assert!(
      matches!(property.value(), super::Parameters::Multiple(params) if params["FREQ"] == "DAILY")
    );
    assert!(
      matches!(property.value(), super::Parameters::Multiple(params) if params["INTERVAL"] == "1")
    );
  }

  #[test]
  fn test_exdate() {
    let property = Property::from_string("EXDATE;VALUE=DATE-TIME:19980313T090000Z").unwrap();

    assert_eq!(property.name(), "EXDATE");
    assert_eq!(property.parameters().len(), 1);
    assert_eq!(property.parameters()["VALUE"], "DATE-TIME");
    assert!(
      matches!(property.value(), super::Parameters::Single(value) if value == &"19980313T090000Z")
    );
  }

  #[test]
  fn test_key_value() {
    let property = Property::from_string("KEY:VALUE").unwrap();

    assert_eq!(property.name(), "KEY");
    assert_eq!(property.parameters().len(), 0);
    assert!(matches!(property.value(), super::Parameters::Single(value) if value == &"VALUE"));
  }

  #[test]
  fn test_rrule_to_string() {
    let rrule_strings = vec![
      "RRULE:FREQ=DAILY;INTERVAL=1",
      "RRULE:FREQ=DAILY;UNTIL=20220101T000000Z;INTERVAL=1",
      "RRULE:INTERVAL=1",
      "RRULE:INTERVAL=1",
    ];

    rrule_strings.iter().for_each(|rrule_string| {
      let property = Property::from_string(rrule_string).unwrap();

      assert_eq!(property.to_string(), rrule_string.to_string());
    });
  }
}
