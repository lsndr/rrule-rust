use std::{fmt, str::FromStr};

use super::parameters::Parameters;

pub enum Value {
  Single(String),
  Parameters(Parameters),
}

#[derive(Debug)]
#[allow(clippy::enum_variant_names)]
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
  parameters: Parameters,
  value: Value,
}

impl Property {
  pub fn name(&self) -> &str {
    &self.name
  }

  pub fn parameters(&self) -> &Parameters {
    &self.parameters
  }

  pub fn value(&self) -> &Value {
    &self.value
  }

  pub fn new(name: String, parameters: Parameters, value: Value) -> Property {
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

    if let Value::Single(_) = parameters {
      return Err(Error::InvalidParameters(key_value[0].to_string()));
    }

    match parameters {
      Value::Parameters(parameters) => Ok(Property {
        name,
        parameters,
        value,
      }),
      Value::Single(_) => Err(Error::InvalidParameters(key_value[0].to_string())),
    }
  }

  fn parse_name(str: &str) -> Result<(String, Value), Error> {
    let name_params: Vec<&str> = str.split(';').take(2).collect();

    let name = name_params[0].trim().to_uppercase();
    let params = Self::parse_parameters(name_params.get(1).unwrap_or(&"").trim())?;

    Ok((name, params))
  }

  fn parse_parameters(str: &str) -> Result<Value, Error> {
    let mut params = Parameters::new();
    let param_strings = str.split(';');

    for param_string in param_strings {
      let param_string = param_string.trim();
      let (key, value) = Self::parse_parameter(param_string)?;

      if let Some(name) = key {
        params.insert(name.to_uppercase(), value.to_string());
      } else if params.is_empty() && !param_string.is_empty() {
        return Ok(Value::Single(param_string.to_string()));
      } else if !params.is_empty() {
        return Err(Error::InvalidParameters(str.to_string()));
      }
    }

    Ok(Value::Parameters(params))
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

impl FromStr for Property {
  type Err = Error;

  fn from_str(str: &str) -> Result<Self, Self::Err> {
    Property::from_string(str)
  }
}

impl fmt::Display for Property {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    let mut string = self.name.to_string();

    for (key, value) in self.parameters.iter() {
      string.push_str(&format!(";{}={}", key, value));
    }

    string.push(':');

    match &self.value {
      Value::Single(value) => string.push_str(value),
      Value::Parameters(values) => {
        let mut values = values.iter();

        if let Some((key, value)) = values.next() {
          string.push_str(&format!("{}={}", key, value));

          for (key, value) in values {
            string.push_str(&format!(";{}={}", key, value));
          }
        }
      }
    }

    write!(f, "{}", string)
  }
}
