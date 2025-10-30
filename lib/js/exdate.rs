use crate::rrule::{
  datetime::{self},
  exdate,
};
use napi_derive::napi;

#[napi(js_name = "ExDate")]
pub struct ExDate {
  exdate: exdate::ExDate,
}

#[napi]
impl ExDate {
  #[napi(constructor)]
  pub fn new(
    #[napi(ts_arg_type = "readonly number[]")] datetimes: Vec<i64>,
    tzid: Option<String>,
  ) -> napi::Result<Self> {
    let tzid: Option<chrono_tz::Tz> = match tzid {
      Some(tzid) => Some(
        tzid
          .parse()
          .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?,
      ),
      None => None,
    };

    let exdate = exdate::ExDate::new(
      datetimes
        .into_iter()
        .map(|datetime| datetime::DateTime::from(datetime))
        .collect(),
      tzid,
      None,
    )
    .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    Ok(Self { exdate })
  }

  #[napi(getter)]
  pub fn values(&self) -> napi::Result<Vec<i64>> {
    Ok(self.exdate.values().iter().map(|dt| dt.into()).collect())
  }

  #[napi(getter)]
  pub fn tzid(&self) -> napi::Result<Option<String>> {
    Ok(self.exdate.tzid().and_then(|tzid| Some(tzid.to_string())))
  }
}

impl Into<exdate::ExDate> for &ExDate {
  fn into(self) -> exdate::ExDate {
    self.exdate.clone()
  }
}

impl From<exdate::ExDate> for ExDate {
  fn from(exdate: exdate::ExDate) -> Self {
    Self { exdate }
  }
}
