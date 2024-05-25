use super::property::{Error, Property};

pub struct Properties<'a> {
  items: Vec<Property<'a>>,
}

impl<'a> Properties<'a> {
  pub fn items(&self) -> &Vec<Property<'a>> {
    &self.items
  }

  pub fn from_string<'b>(str: &'b str) -> Result<Properties<'b>, Error> {
    let mut items = Vec::new();
    let property_strings = str.split('\n');

    for property_string in property_strings {
      items.push(Property::from_string(property_string)?);
    }

    Ok(Properties { items })
  }
}
