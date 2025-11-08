use super::exdate::ExDate;
use super::rdate::RDate;
use super::rrule::RRule;
use crate::rrule::datetime::DateTime;
use crate::rrule::dtstart::DtStart;
use crate::rrule::value_type::ValueType;
use crate::rrule::{exdate, rdate, rrule, rrule_set};
#[cfg(not(target_family = "wasm"))]
use napi::bindgen_prelude::{Int32Array, Int32ArraySlice, Reference, SharedReference};
#[cfg(target_family = "wasm")]
use napi::bindgen_prelude::{Int32Array, Reference, SharedReference};
use napi::Env;
use napi_derive::napi;
use replace_with::replace_with_or_abort_and_return;

#[napi(js_name = "RRuleSet")]
pub struct RRuleSet {
  rrule_set: rrule_set::RRuleSet,
}

#[napi]
impl RRuleSet {
  #[napi(constructor)]
  pub fn new(
    dtstart: Int32Array,
    tzid: Option<String>,
    dtstart_value: Option<String>,
    #[napi(ts_arg_type = "(readonly RRule[]) | undefined | null")] rrules: Option<Vec<&RRule>>,
    #[napi(ts_arg_type = "(readonly RRule[]) | undefined | null")] exrules: Option<Vec<&RRule>>,
    #[napi(ts_arg_type = "(readonly ExDate[]) | undefined | null")] exdates: Option<Vec<&ExDate>>,
    #[napi(ts_arg_type = "(readonly RDate[]) | undefined | null")] rdates: Option<Vec<&RDate>>,
  ) -> napi::Result<Self> {
    let tzid: Option<chrono_tz::Tz> = match tzid {
      Some(tzid) => Some(
        tzid
          .parse()
          .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?,
      ),
      None => None,
    };

    let dtstat_value = dtstart_value
      .map(|value| value.parse::<ValueType>())
      .transpose()
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    let dtstart = DtStart::new(dtstart.into(), tzid, dtstat_value)
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    let rrules: Vec<rrule::RRule> = rrules
      .unwrap_or_default()
      .into_iter()
      .map(|rrule| rrule.into())
      .collect();

    let exrules: Vec<rrule::RRule> = exrules
      .unwrap_or_default()
      .into_iter()
      .map(|rrule| rrule.into())
      .collect();

    let exdates: Vec<exdate::ExDate> = exdates
      .unwrap_or_default()
      .into_iter()
      .map(Into::into)
      .collect();

    let rdates: Vec<rdate::RDate> = rdates
      .unwrap_or_default()
      .into_iter()
      .map(Into::into)
      .collect();

    let rrule_set = rrule_set::RRuleSet::new(dtstart)
      .set_rrules(rrules)
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?
      .set_exrules(exrules)
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?
      .set_exdates(exdates)
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?
      .set_rdates(rdates)
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    Ok(Self { rrule_set })
  }

  #[napi(getter)]
  pub fn tzid(&self) -> napi::Result<Option<String>> {
    Ok(self.rrule_set.dtstart().tzid().map(|tzid| tzid.to_string()))
  }

  #[napi(getter)]
  pub fn dtstart(&self) -> napi::Result<Int32Array> {
    Ok(self.rrule_set.dtstart().value().into())
  }

  #[napi(getter, ts_return_type = "RRule[]")]
  pub fn rrules(&self) -> napi::Result<Vec<RRule>> {
    Ok(
      self
        .rrule_set
        .rrules()
        .iter()
        .map(|rrule| rrule.clone().into())
        .collect(),
    )
  }

  #[napi(getter, ts_return_type = "RRule[]")]
  pub fn exrules(&self) -> napi::Result<Vec<RRule>> {
    Ok(
      self
        .rrule_set
        .exrules()
        .iter()
        .map(|rrule| rrule.clone().into())
        .collect(),
    )
  }

  #[napi(getter, ts_return_type = "ExDate[]")]
  pub fn exdates(&self) -> napi::Result<Vec<ExDate>> {
    Ok(
      self
        .rrule_set
        .exdates()
        .iter()
        .map(|exdate| exdate.clone().into())
        .collect(),
    )
  }

  #[napi(getter, ts_return_type = "RDate[]")]
  pub fn rdates(&self) -> napi::Result<Vec<RDate>> {
    Ok(
      self
        .rrule_set
        .rdates()
        .iter()
        .map(|rdate| rdate.clone().into())
        .collect(),
    )
  }

  #[napi(factory, ts_return_type = "RRuleSet")]
  pub fn parse(str: String) -> napi::Result<Self> {
    let rrule_set: rrule_set::RRuleSet = str
      .parse()
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    Ok(Self { rrule_set })
  }

  #[napi]
  pub fn all(&self, limit: Option<i32>) -> napi::Result<Int32Array> {
    let mut arr = match limit {
      Some(l) => Vec::<i32>::with_capacity((l as usize) * 8),
      None => Vec::<i32>::with_capacity(800),
    };

    let iter = self
      .rrule_set
      .iterator()
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    for (index, datetime) in iter.enumerate() {
      if let Some(limit) = limit {
        if index as i32 >= limit {
          break;
        }
      }

      arr.push(datetime.offset().unwrap_or(-1));
      arr.push(datetime.year() as i32);
      arr.push(datetime.month() as i32);
      arr.push(datetime.day() as i32);

      if let Some(time) = datetime.time() {
        arr.push(time.hour() as i32);
        arr.push(time.minute() as i32);
        arr.push(time.second() as i32);
        arr.push(if time.utc() { 1 } else { 0 });
      } else {
        arr.push(-1);
        arr.push(-1);
        arr.push(-1);
        arr.push(-1);
      }
    }

    Ok(Int32Array::new(arr))
  }

  fn is_after(&self, timestamp: i64, after_timestamp: i64, inclusive: Option<bool>) -> bool {
    let is_inclusive = inclusive.unwrap_or(false);

    if is_inclusive {
      timestamp >= after_timestamp
    } else {
      timestamp > after_timestamp
    }
  }

  fn is_before(&self, timestamp: i64, before_timestamp: i64, inclusive: Option<bool>) -> bool {
    let is_inclusive = inclusive.unwrap_or(false);

    if is_inclusive {
      timestamp <= before_timestamp
    } else {
      timestamp < before_timestamp
    }
  }

  #[napi]
  pub fn between(
    &self,
    after_datetime: Int32Array,
    before_datetime: Int32Array,
    inclusive: Option<bool>,
  ) -> napi::Result<Int32Array> {
    let mut arr = Vec::<i32>::new();

    let timezone = self.rrule_set.dtstart().derive_timezone();
    let after_timestamp = DateTime::from(after_datetime)
      .to_datetime(&timezone)
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?
      .timestamp_millis();
    let before_timestamp = DateTime::from(before_datetime)
      .to_datetime(&timezone)
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?
      .timestamp_millis();

    let iterator = self
      .rrule_set
      .iterator()
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    for date in iterator {
      let date_timestamp = date
        .to_datetime(&timezone)
        .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?
        .timestamp_millis();
      let is_after = self.is_after(date_timestamp, after_timestamp, inclusive);
      let is_before = self.is_before(date_timestamp, before_timestamp, inclusive);

      if is_after && is_before {
        arr.push(date.offset().unwrap_or(-1));
        arr.push(date.year() as i32);
        arr.push(date.month() as i32);
        arr.push(date.day() as i32);

        if let Some(time) = date.time() {
          arr.push(time.hour() as i32);
          arr.push(time.minute() as i32);
          arr.push(time.second() as i32);
          arr.push(if time.utc() { 1 } else { 0 });
        } else {
          arr.push(-1);
          arr.push(-1);
          arr.push(-1);
          arr.push(-1);
        }
      } else if !is_before {
        break;
      }
    }

    Ok(Int32Array::new(arr))
  }

  #[napi]
  pub fn set_from_string(&mut self, str: String) -> napi::Result<&Self> {
    replace_with_or_abort_and_return(&mut self.rrule_set, |set| {
      let new_set = set.clone();

      match new_set.set_from_string(&str) {
        Ok(set) => (None, set),
        Err(e) => (Some(e), set),
      }
    });

    Ok(self)
  }

  #[napi]
  pub fn to_string(&self) -> napi::Result<String> {
    Ok(self.rrule_set.to_string())
  }

  #[napi]
  pub fn iterator(&self, this: Reference<RRuleSet>, env: Env) -> napi::Result<RRuleSetIterator> {
    let iterator = this.share_with(env, |set: &mut RRuleSet| {
      set
        .rrule_set
        .iterator()
        .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))
    })?;

    Ok(RRuleSetIterator { iterator })
  }
}

#[napi]
pub struct RRuleSetIterator {
  iterator: SharedReference<RRuleSet, rrule_set::RRuleSetIterator>,
}

#[napi]
impl RRuleSetIterator {
  #[napi(ts_return_type = "boolean | Int32Array | null")]
  #[allow(clippy::should_implement_trait)]
  #[cfg(not(target_family = "wasm"))]
  pub fn next(&mut self, mut store: Int32ArraySlice<'_>) -> bool {
    let next = self.iterator.next();

    match next {
      Some(dt) => unsafe {
        let data: &mut [i32] = store.as_mut();

        // TODO: remove code duplication
        data[0] = dt.offset().unwrap_or(-1);
        data[1] = dt.year() as i32;
        data[2] = dt.month() as i32;
        data[3] = dt.day() as i32;

        if let Some(time) = dt.time() {
          data[4] = time.hour() as i32;
          data[5] = time.minute() as i32;
          data[6] = time.second() as i32;
          data[7] = if time.utc() { 1 } else { 0 };
        } else {
          data[4] = -1;
          data[5] = -1;
          data[6] = -1;
          data[7] = -1;
        }

        true
      },
      None => false,
    }
  }

  #[napi]
  #[allow(clippy::should_implement_trait)]
  #[cfg(target_family = "wasm")]
  pub fn next(&mut self) -> Option<Int32Array> {
    let next = self.iterator.next();

    match next {
      Some(dt) => Some((&dt).into()),
      None => None,
    }
  }
}
