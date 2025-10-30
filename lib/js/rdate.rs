use crate::rrule::{
  datetime::{self},
  rdate,
};
use napi_derive::napi;

#[napi(js_name = "RDate")]
pub struct RDate {
  rdate: rdate::RDate,
}

#[napi]
impl RDate {
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

    let rdate = rdate::RDate::new(
      datetimes
        .into_iter()
        .map(|datetime| datetime::DateTime::from(datetime))
        .collect(),
      tzid,
      None,
    )
    .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    Ok(Self { rdate })
  }

  #[napi(getter)]
  pub fn values(&self) -> napi::Result<Vec<i64>> {
    Ok(self.rdate.values().iter().map(|dt| dt.into()).collect())
  }

  #[napi(getter)]
  pub fn tzid(&self) -> napi::Result<Option<String>> {
    Ok(self.rdate.tzid().and_then(|tzid| Some(tzid.to_string())))
  }
}

impl Into<rdate::RDate> for &RDate {
  fn into(self) -> rdate::RDate {
    self.rdate.clone()
  }
}

impl From<rdate::RDate> for RDate {
  fn from(rdate: rdate::RDate) -> Self {
    Self { rdate }
  }
}
