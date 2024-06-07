use std::{ops::Index, str::FromStr};

use indexmap::IndexMap;

pub struct Parameters {
  params: IndexMap<String, String>,
}

impl Parameters {
  pub fn new() -> Self {
    Self {
      params: IndexMap::new(),
    }
  }

  pub fn insert(&mut self, key: String, value: String) {
    self.params.insert(key.to_uppercase(), value);
  }

  pub fn get(&self, key: &str) -> Option<&String> {
    self.params.get(&key.to_uppercase())
  }

  pub fn get_as<T: FromStr>(&self, key: &str) -> Result<Option<T>, String> {
    match self.get(key) {
      Some(value) => Ok(Some(value_as::<T>(key, value)?)),
      None => Ok(None),
    }
  }

  pub fn get_as_vec<T: FromStr>(&self, key: &str) -> Result<Option<Vec<T>>, String> {
    match self.get(key) {
      Some(value) => {
        let mut data = Vec::<T>::new();

        for item in value.split(',') {
          data.push(value_as::<T>(key, item)?);
        }

        Ok(Some(data))
      }
      None => Ok(None),
    }
  }

  pub fn len(&self) -> usize {
    self.params.len()
  }

  pub fn is_empty(&self) -> bool {
    self.params.is_empty()
  }

  pub fn iter(&self) -> indexmap::map::Iter<String, String> {
    self.params.iter()
  }

  pub fn clear(&mut self) {
    self.params.clear();
  }
}

impl Index<&str> for Parameters {
  type Output = String;

  fn index(&self, key: &str) -> &Self::Output {
    self.params.get(key).unwrap()
  }
}

impl IntoIterator for Parameters {
  type Item = (String, String);
  type IntoIter = indexmap::map::IntoIter<String, String>;

  fn into_iter(self) -> Self::IntoIter {
    self.params.into_iter()
  }
}

fn value_as<T: FromStr>(key: &str, value: &str) -> Result<T, String> {
  value
    .parse::<T>()
    .map_err(|_| format!("Invalid {} value: {}", key, value))
}
