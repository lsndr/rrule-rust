use std::{any::type_name, str::FromStr};

pub trait ToVec<'a, T>
where
  T: FromStr,
{
  fn to_vec(&self) -> Result<Vec<T>, String>;
}

impl<'a, T> ToVec<'a, T> for &str
where
  T: FromStr,
{
  fn to_vec(&self) -> Result<Vec<T>, String> {
    let mut data = Vec::new();

    for item in self.split(',') {
      data.push(
        item
          .parse()
          .map_err(|_| format!("Couldn't convert {} to {}", item, type_name::<T>()))?,
      )
    }

    Ok(data)
  }
}
