use crate::rrule::{
  datetime::{self},
  exdate,
};
use napi::bindgen_prelude::Float64Array;
use napi_derive::napi;

#[napi(js_name = "ExDate")]
pub struct ExDate {
  exdate: exdate::ExDate,
}

#[napi]
impl ExDate {
  #[napi(constructor)]
  pub fn new(dates: Float64Array, tzid: Option<String>) -> napi::Result<Self> {
    let tzid: Option<chrono_tz::Tz> = match tzid {
      Some(tzid) => Some(
        tzid
          .parse()
          .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?,
      ),
      None => None,
    };

    let mut datetimes = Vec::<datetime::DateTime>::new();

    for chunk in dates.chunks(8) {
      datetimes.push(
        (
          chunk[0], chunk[1], chunk[2], chunk[3], chunk[4], chunk[5], chunk[6], chunk[7],
        )
          .into(),
      );
    }

    let exdate = exdate::ExDate::new(datetimes, tzid, None)
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    Ok(Self { exdate })
  }

  #[napi(getter)]
  pub fn values(&self) -> napi::Result<Float64Array> {
    let mut arr = Vec::new();

    for datetime in self.exdate.values().iter() {
      arr.push(datetime.timestamp().unwrap_or(-1) as f64);
      arr.push(datetime.year().into());
      arr.push(datetime.month().into());
      arr.push(datetime.day().into());

      if let Some(time) = datetime.time() {
        arr.push(time.hour().into());
        arr.push(time.minute().into());
        arr.push(time.second().into());
        arr.push(if time.utc() { 1.0 } else { 0.0 });
      } else {
        arr.push(-1.0);
        arr.push(-1.0);
        arr.push(-1.0);
        arr.push(-1.0);
      }
    }

    Ok(Float64Array::new(arr))
  }

  #[napi(getter)]
  pub fn tzid(&self) -> napi::Result<Option<String>> {
    Ok(self.exdate.tzid().and_then(|tzid| Some(tzid.to_string())))
  }
}

impl From<&ExDate> for exdate::ExDate {
  fn from(val: &ExDate) -> Self {
    val.exdate.clone()
  }
}

impl From<exdate::ExDate> for ExDate {
  fn from(exdate: exdate::ExDate) -> Self {
    Self { exdate }
  }
}
