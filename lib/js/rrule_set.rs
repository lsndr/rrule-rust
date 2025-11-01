use super::exdate::ExDate;
use super::rdate::RDate;
use super::rrule::RRule;
use crate::rrule::datetime::DateTime;
use crate::rrule::dtstart::DtStart;
use crate::rrule::value_type::ValueType;
use crate::rrule::{exdate, rdate, rrule, rrule_set};
use napi::bindgen_prelude::{Array, Reference, SharedReference};
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
        .into_iter()
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

  #[napi(ts_return_type = "number[]")]
  pub fn all<'a>(&'a self, env: &'a Env, limit: Option<i32>) -> napi::Result<Array<'a>> {
    let mut arr = env.create_array(0).unwrap();

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

      let datetime: i64 = (&datetime).into();
      arr.insert(datetime).unwrap();
    }

    Ok(arr)
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
  pub fn between<'a>(
    &'a self,
    env: &'a Env,
    after_datetime: i64,
    before_datetime: i64,
    inclusive: Option<bool>,
  ) -> napi::Result<Array<'a>> {
    let mut arr = env.create_array(0).unwrap();
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
  pub fn iterator(&self, this: Reference<RRuleSet>, env: Env) -> napi::Result<RRuleSetIterator> {
    let iterator = this.share_with(env, |set: &mut RRuleSet| {
      Ok(
        set
          .rrule_set
          .iterator()
          .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?,
      )
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
  #[napi]
  pub fn next(&mut self) -> Option<i64> {
    self.iterator.next().map(|date: DateTime| (&date).into())
  }
}
