use std::{collections::HashMap, fmt};

pub enum Parameters<'a> {
  Single(&'a str),
  Multiple(HashMap<String, &'a str>),
}

#[derive(Debug)]
pub enum Error<'a> {
  InvalidProperty(&'a str),
  InvalidParameter(&'a str),
  InvalidParameters(&'a str),
}

impl fmt::Display for Error<'_> {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    match self {
      Error::InvalidProperty(str) => write!(f, "Invalid property: {}", str),
      Error::InvalidParameter(str) => write!(f, "Invalid parameter: {}", str),
      Error::InvalidParameters(str) => write!(f, "Invalid parameters: {}", str),
    }
  }
}

pub struct Property<'a> {
  name: String,
  parameters: HashMap<String, &'a str>,
  value: Parameters<'a>,
}

impl<'a> Property<'a> {
  pub fn name(&self) -> &str {
    &self.name
  }

  pub fn parameters(&self) -> &HashMap<String, &str> {
    &self.parameters
  }

  pub fn value(&self) -> &Parameters<'a> {
    &self.value
  }

  pub fn from_string<'b>(str: &'b str) -> Result<Property<'b>, Error> {
    let key_value: Vec<&str> = str.split(':').collect();

    if key_value.len() != 2 {
      return Err(Error::InvalidProperty(str));
    }

    let (name, parameters) = Self::parse_name(key_value[0].trim())?;
    let value = Self::parse_parameters(key_value[1].trim())?;

    if let Parameters::Single(_) = parameters {
      return Err(Error::InvalidParameters(key_value[0]));
    }

    match parameters {
      Parameters::Multiple(parameters) => Ok(Property {
        name,
        parameters,
        value,
      }),
      Parameters::Single(_) => Err(Error::InvalidParameters(key_value[0])),
    }
  }

  fn parse_name(str: &str) -> Result<(String, Parameters), Error> {
    let name_params: Vec<&str> = str.split(';').take(2).collect();

    let name = name_params[0].trim().to_uppercase();
    let params = Self::parse_parameters(name_params.get(1).unwrap_or(&"").trim())?;

    Ok((name, params))
  }

  fn parse_parameters(str: &str) -> Result<Parameters, Error> {
    let mut params = HashMap::new();
    let param_strings = str.split(';');

    for param_string in param_strings {
      let param_string = param_string.trim();
      let (key, value) = Self::parse_parameter(param_string)?;

      if let Some(name) = key {
        params.insert(name.to_uppercase(), value);
      } else if params.len() == 0 && param_string.len() > 0 {
        return Ok(Parameters::Single(param_string));
      } else if params.len() > 0 {
        return Err(Error::InvalidParameters(str));
      }
    }

    Ok(Parameters::Multiple(params))
  }

  fn parse_parameter(str: &str) -> Result<(Option<String>, &str), Error> {
    let key_value: Vec<&str> = str.split('=').collect();

    if key_value.len() == 1 {
      return Ok((None, key_value[0].trim()));
    } else if key_value.len() > 2 {
      return Err(Error::InvalidParameter(str));
    }

    Ok((
      Some(key_value[0].trim().to_uppercase()),
      key_value[1].trim(),
    ))
  }
}

#[cfg(test)]
mod tests {
  use super::Parameters;
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

    if let Parameters::Single(value) = property.value() {
      println!("{}", value)
    }

    assert_eq!(property.name(), "KEY");
    assert_eq!(property.parameters().len(), 0);
    assert!(matches!(property.value(), super::Parameters::Single(value) if value == &"VALUE"));
  }
}
