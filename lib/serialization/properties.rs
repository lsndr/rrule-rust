use super::property::{Error, Property};

pub struct Properties {
  items: Vec<Property>,
}

impl Properties {
  pub fn new() -> Self {
    Properties { items: Vec::new() }
  }

  pub fn push(&mut self, property: Property) {
    self.items.push(property);
  }

  pub fn to_string(&self) -> String {
    let mut string = String::new();
    let mut iter = self.items.iter();

    if let Some(property) = iter.next() {
      string.push_str(&property.to_string());
    }

    for property in iter {
      string.push('\n');
      string.push_str(&property.to_string());
    }

    string
  }

  pub fn from_str(str: &str) -> Result<Properties, Error> {
    let mut items = Vec::new();

    for property_string in str.lines() {
      let property_string = property_string.trim();

      if property_string.is_empty() {
        continue;
      }

      items.push(Property::from_string(property_string)?);
    }

    Ok(Properties { items })
  }
}

impl IntoIterator for Properties {
  type Item = Property;
  type IntoIter = std::vec::IntoIter<Self::Item>;

  fn into_iter(self) -> Self::IntoIter {
    self.items.into_iter()
  }
}
