use napi::Error;
use std::{any::type_name, str::FromStr};

pub trait ToVec<T>
where
  T: FromStr,
{
  fn to_vec(&self) -> Result<Vec<T>, Error>;
}

impl<T> ToVec<T> for &str
where
  T: FromStr,
{
  fn to_vec(&self) -> Result<Vec<T>, Error> {
    let mut data = Vec::new();

    for item in self.split(',') {
      data.push(item.parse().map_err(|_| {
        napi::Error::new(
          napi::Status::GenericFailure,
          format!("Couldn't convert {} to {}", item, type_name::<T>()),
        )
      })?)
    }

    Ok(data)
  }
}
