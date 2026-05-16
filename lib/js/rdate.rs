use crate::rrule::{
  datetime::{self, index_from_tz},
  rdate,
};
use napi::bindgen_prelude::Int32Array;
use napi_derive::napi;

#[napi(js_name = "RDate")]
pub struct RDate {
  rdate: rdate::RDate,
}

#[napi]
impl RDate {
  #[napi(constructor)]
  pub fn new(dates: Int32Array, tzid: Option<String>) -> napi::Result<Self> {
    let tzid: Option<chrono_tz::Tz> = match tzid {
      Some(tzid) => Some(
        tzid
          .parse()
          .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?,
      ),
      None => None,
    };

    let mut datetimes = Vec::<datetime::DateTime>::new();

    for chunk in dates.chunks(7) {
      datetimes.push(
        (
          chunk[0], chunk[1], chunk[2], chunk[3], chunk[4], chunk[5], chunk[6],
        )
          .into(),
      );
    }

    let rdate = rdate::RDate::new(datetimes, tzid, None)
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    Ok(Self { rdate })
  }

  #[napi(getter)]
  pub fn values(&self) -> napi::Result<Int32Array> {
    use chrono::{Datelike, Timelike};
    let mut arr = Vec::new();

    for datetime in self.rdate.values().iter() {
      let d = datetime.date();
      arr.push(d.year());
      arr.push(d.month() as i32);
      arr.push(d.day() as i32);
      if let Some(dt) = datetime.as_datetime() {
        arr.push(dt.hour() as i32);
        arr.push(dt.minute() as i32);
        arr.push(dt.second() as i32);
        arr.push(index_from_tz(dt.timezone()));
      } else {
        arr.push(-1);
        arr.push(-1);
        arr.push(-1);
        arr.push(-1);
      }
    }

    Ok(Int32Array::new(arr))
  }

  #[napi(getter)]
  pub fn tzid(&self) -> napi::Result<Option<String>> {
    Ok(self.rdate.tzid().map(|tzid| tzid.to_string()))
  }
}

impl From<&RDate> for rdate::RDate {
  fn from(val: &RDate) -> Self {
    val.rdate.clone()
  }
}

impl From<rdate::RDate> for RDate {
  fn from(rdate: rdate::RDate) -> Self {
    Self { rdate }
  }
}
