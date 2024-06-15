use super::rrule::RRule;
use crate::rrule::datetime::DateTime;
use crate::rrule::dtstart::DtStart;
use crate::rrule::exdate::ExDate;
use crate::rrule::rdate::RDate;
use crate::rrule::{rrule, rrule_set};
use napi::bindgen_prelude::{Array, Reference, SharedReference};
use napi::iterator::Generator;
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
    dtstart: i64,
    tzid: Option<String>,
    #[napi(ts_arg_type = "(readonly RRule[]) | undefined | null")] rrules: Option<Vec<&RRule>>,
    #[napi(ts_arg_type = "(readonly RRule[]) | undefined | null")] exrules: Option<Vec<&RRule>>,
    #[napi(ts_arg_type = "(readonly number[]) | undefined | null")] exdates: Option<Vec<i64>>,
    #[napi(ts_arg_type = "(readonly number[]) | undefined | null")] rdates: Option<Vec<i64>>,
  ) -> napi::Result<Self> {
    let tzid: Option<chrono_tz::Tz> = match tzid {
      Some(tzid) => Some(
        tzid
          .parse()
          .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?,
      ),
      None => None,
    };

    let dtstart = DtStart::new(dtstart.into(), tzid)
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

    let exdates: Vec<ExDate> = exdates
      .unwrap_or_default()
      .into_iter()
      .map(Into::into)
      .collect();

    let rdates: Vec<RDate> = rdates
      .unwrap_or_default()
      .into_iter()
      .map(Into::into)
      .collect();

    let rrule_set = rrule_set::RRuleSet::new(dtstart)
      .set_rrules(rrules)
      .set_exrules(exrules)
      .set_exdates(exdates)
      .set_rdates(rdates);

    Ok(Self { rrule_set })
  }

  #[napi(getter)]
  pub fn tzid(&self) -> napi::Result<Option<String>> {
    Ok(
      self
        .rrule_set
        .dtstart()
        .tzid()
        .and_then(|tzid| Some(tzid.to_string())),
    )
  }

  #[napi(getter)]
  pub fn dtstart(&self) -> napi::Result<i64> {
    Ok(self.rrule_set.dtstart().datetime().into())
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
        .into_iter()
        .map(|rrule| rrule.clone().into())
        .collect(),
    )
  }

  #[napi(getter, ts_return_type = "number[]")]
  pub fn exdates(&self) -> napi::Result<Vec<i64>> {
    let mut exdates = Vec::<i64>::new();

    for exdate in self.rrule_set.exdates() {
      let datetimes = exdate
        .to_datetimes(&self.rrule_set.dtstart())
        .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

      for datetime in datetimes.iter() {
        let datetime = datetime.with_timezone(&self.rrule_set.dtstart().timezone());
        let datetime = DateTime::from(&datetime);

        exdates.push((&datetime).into());
      }
    }

    Ok(exdates)
  }

  #[napi(getter, ts_return_type = "number[]")]
  pub fn rdates(&self) -> napi::Result<Vec<i64>> {
    let mut rdates = Vec::<i64>::new();

    for rdate in self.rrule_set.rdates() {
      let datetimes = rdate
        .to_datetimes(&self.rrule_set.dtstart())
        .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

      for datetime in datetimes.iter() {
        let datetime = datetime.with_timezone(&self.rrule_set.dtstart().timezone());
        let datetime = DateTime::from(&datetime);

        rdates.push((&datetime).into());
      }
    }

    Ok(rdates)
  }

  #[napi(factory, ts_return_type = "RRuleSet")]
  pub fn parse(str: String) -> napi::Result<Self> {
    let rrule_set: rrule_set::RRuleSet = str
      .parse()
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    Ok(Self { rrule_set })
  }

  #[napi(ts_return_type = "number[]")]
  pub fn all(&self, limit: Option<i32>) -> napi::Result<Vec<i64>> {
    let iterator = self.rrule_set.iterator();
    let iter = iterator.into_iter().map(|date| (&date).into());

    if let Some(limit) = limit {
      return Ok(iter.take(limit as usize).collect());
    }

    Ok(iter.collect())
  }

  fn is_after(&self, timestamp: i64, after_timestamp: i64, inclusive: Option<bool>) -> bool {
    let inclusive = inclusive.unwrap_or(false);

    if inclusive && timestamp < after_timestamp {
      return false;
    } else if !inclusive && timestamp <= after_timestamp {
      return false;
    }

    true
  }

  fn is_before(&self, timestamp: i64, before_timestamp: i64, inclusive: Option<bool>) -> bool {
    let inclusive = inclusive.unwrap_or(false);

    if inclusive && timestamp > before_timestamp {
      return false;
    } else if !inclusive && timestamp >= before_timestamp {
      return false;
    }

    true
  }

  #[napi(ts_return_type = "number[]")]
  pub fn between(
    &self,
    env: Env,
    after_datetime: i64,
    before_datetime: i64,
    inclusive: Option<bool>,
  ) -> napi::Result<Array> {
    let mut arr = env.create_array(0).unwrap();
    let timezone = self.rrule_set.dtstart().timezone();
    let after_timestamp = DateTime::from(after_datetime)
      .to_datetime(&timezone)
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?
      .timestamp_millis();
    let before_timestamp = DateTime::from(before_datetime)
      .to_datetime(&timezone)
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?
      .timestamp_millis();

    let iterator = self.rrule_set.iterator();
    let iter = iterator.into_iter();

    for date in iter {
      let date_timestamp = date
        .to_datetime(&timezone)
        .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?
        .timestamp_millis();
      let is_after = self.is_after(date_timestamp, after_timestamp, inclusive);
      let is_before = self.is_before(date_timestamp, before_timestamp, inclusive);

      if is_after && is_before {
        let datetime: i64 = (&date).into();

        arr.insert(datetime).unwrap();
      } else if !is_before {
        break;
      }
    }

    Ok(arr)
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
  pub fn iterator(&self) -> napi::Result<RRuleSetIterator> {
    Ok(RRuleSetIterator {
      iterator: self.rrule_set.iterator(),
    })
  }
}

#[napi]
pub struct RRuleSetIterator {
  iterator: rrule_set::RRuleSetIterator,
}

#[napi]
impl RRuleSetIterator {
  #[napi]
  pub fn iterator(
    &self,
    this: Reference<RRuleSetIterator>,
    env: Env,
  ) -> napi::Result<RRuleSetIteratorIterable> {
    let iterator = this.share_with(env, |iter: &mut RRuleSetIterator| {
      Ok(iter.iterator.into_iter())
    })?;

    Ok(RRuleSetIteratorIterable { iterator })
  }
}

#[napi(iterator)]
pub struct RRuleSetIteratorIterable {
  iterator: SharedReference<RRuleSetIterator, rrule_set::RRuleSetIteratorIterable<'static>>,
}

#[napi]
impl Generator for RRuleSetIteratorIterable {
  type Yield = i64;
  type Next = ();
  type Return = ();

  fn next(&mut self, _next: Option<Self::Next>) -> Option<Self::Yield> {
    self.iterator.next().map(|date: DateTime| (&date).into())
  }
}
