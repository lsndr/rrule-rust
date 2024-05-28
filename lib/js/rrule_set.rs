use super::RRule;
use napi::bindgen_prelude::{Array, Reference, SharedReference};
use napi::iterator::Generator;
use napi::Env;
use napi_derive::napi;
use replace_with::replace_with_or_abort;

#[napi(js_name = "RRuleSet")]
pub struct RRuleSet {
  rrule_set: rrule::RRuleSet,
}

#[napi]
impl RRuleSet {
  #[napi(constructor)]
  pub fn new(dtstart: i64, tzid: String) -> napi::Result<Self> {
    let timezone: chrono_tz::Tz = tzid
      .parse()
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;
    let datetime = super::DateTime::from(dtstart);
    let datetime = datetime
      .to_rrule_datetime(&rrule::Tz::Tz(timezone))?
      .with_timezone(&rrule::Tz::Tz(timezone));
    let rrule_set = rrule::RRuleSet::new(datetime);

    Ok(RRuleSet { rrule_set })
  }

  #[napi(factory)]
  pub fn create(
    dtstart: i64,
    tzid: String,
    #[napi(ts_arg_type = "(readonly RRule[]) | undefined | null")] rrules: Option<Vec<&RRule>>,
    #[napi(ts_arg_type = "(readonly RRule[]) | undefined | null")] exrules: Option<Vec<&RRule>>,
    #[napi(ts_arg_type = "(readonly number[]) | undefined | null")] exdates: Option<Vec<i64>>,
    #[napi(ts_arg_type = "(readonly number[]) | undefined | null")] rdates: Option<Vec<i64>>,
  ) -> napi::Result<Self> {
    let mut set = Self::new(dtstart, tzid)?;

    if let Some(rrules) = rrules {
      for rrule in rrules.iter() {
        set.add_rrule(rrule)?;
      }
    }

    if let Some(exrules) = exrules {
      for rrule in exrules.iter() {
        set.add_exrule(rrule)?;
      }
    }

    if let Some(exdates) = exdates {
      for datetime in exdates.iter() {
        set.add_exdate(*datetime)?;
      }
    }

    if let Some(rdates) = rdates {
      for datetime in rdates.iter() {
        set.add_rdate(*datetime)?;
      }
    }

    Ok(set)
  }

  #[napi(getter)]
  pub fn tzid(&self) -> napi::Result<String> {
    Ok(self.rrule_set.get_dt_start().timezone().to_string())
  }

  #[napi(getter)]
  pub fn dtstart(&self) -> napi::Result<i64> {
    let dtstart = *self.rrule_set.get_dt_start();
    let dtstart: i64 = super::DateTime::from(dtstart).into();

    Ok(dtstart)
  }

  #[napi(getter, ts_return_type = "RRule[]")]
  pub fn rrules(&self, env: Env) -> Array {
    let mut arr = env.create_array(0).unwrap();
    let rrules = self.rrule_set.get_rrule();

    for rrule in rrules.iter() {
      arr.insert(RRule::from(to_unvalidated(rrule))).unwrap();
    }

    arr
  }

  #[napi(getter, ts_return_type = "RRule[]")]
  pub fn exrules(&self, env: Env) -> Array {
    let mut arr = env.create_array(0).unwrap();
    let rrules = self.rrule_set.get_exrule();

    for rrule in rrules.iter() {
      arr.insert(RRule::from(to_unvalidated(rrule))).unwrap();
    }

    arr
  }

  #[napi(getter, ts_return_type = "number[]")]
  pub fn exdates(&self, env: Env) -> Array {
    let mut arr = env.create_array(0).unwrap();
    let dates = self.rrule_set.get_exdate();

    for date in dates.iter() {
      let datetime: i64 = super::DateTime::from(*date).into();

      arr.insert(datetime).unwrap();
    }

    arr
  }

  #[napi(getter, ts_return_type = "number[]")]
  pub fn rdates(&self, env: Env) -> Array {
    let mut arr = env.create_array(0).unwrap();
    let dates = self.rrule_set.get_rdate();

    for date in dates.iter() {
      let datetime: i64 = super::DateTime::from(*date).into();

      arr.insert(datetime).unwrap();
    }

    arr
  }

  #[napi(factory, ts_return_type = "RRuleSet")]
  pub fn parse(str: String) -> napi::Result<Self> {
    let set: Self = str.parse()?;

    Ok(set)
  }

  #[napi]
  pub fn set_dtstart(&mut self, str: String) -> napi::Result<&Self> {
    let rrule_set = self
      .rrule_set
      .clone()
      .set_from_string(&str)
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    self.rrule_set = rrule_set;

    Ok(self)
  }

  #[napi]
  pub fn set_from_string(&mut self, str: String) -> napi::Result<&Self> {
    let rrule_set = self
      .rrule_set
      .clone()
      .set_from_string(&str)
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    self.rrule_set = rrule_set;

    Ok(self)
  }

  #[napi]
  pub fn add_rrule(&mut self, rrule: &RRule) -> napi::Result<&Self> {
    let dtstart = *self.rrule_set.get_dt_start();
    let rrule = rrule.validate(dtstart)?;

    replace_with_or_abort(&mut self.rrule_set, |self_| self_.rrule(rrule));

    Ok(self)
  }

  #[napi]
  pub fn add_exrule(&mut self, rrule: &RRule) -> napi::Result<&Self> {
    let dtstart = *self.rrule_set.get_dt_start();
    let rrule = rrule.validate(dtstart)?;

    replace_with_or_abort(&mut self.rrule_set, |self_| self_.exrule(rrule));

    Ok(self)
  }

  #[napi]
  pub fn add_exdate(&mut self, datetime: i64) -> napi::Result<&Self> {
    let timezone = self.rrule_set.get_dt_start().timezone();
    let datetime = super::DateTime::from(datetime).to_rrule_datetime(&timezone)?;

    replace_with_or_abort(&mut self.rrule_set, |self_| self_.exdate(datetime));

    Ok(self)
  }

  #[napi]
  pub fn add_rdate(&mut self, datetime: i64) -> napi::Result<&Self> {
    let timezone = self.rrule_set.get_dt_start().timezone();
    let datetime = super::DateTime::from(datetime).to_rrule_datetime(&timezone)?;

    replace_with_or_abort(&mut self.rrule_set, |self_| self_.rdate(datetime.into()));

    Ok(self)
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
  pub fn all(&self, env: Env, limit: Option<i32>) -> napi::Result<Array> {
    let mut arr = env.create_array(0).unwrap();
    let mut left = limit.unwrap_or(-1);

    for date in self.rrule_set.into_iter() {
      let datetime: i64 = super::DateTime::from(date).into();

      arr.insert(datetime).unwrap();

      left -= 1;

      if left == 0 {
        break;
      }
    }

    Ok(arr)
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
    let timezone = self.rrule_set.get_dt_start().timezone();
    let after_timestamp = super::DateTime::from(after_datetime)
      .to_rrule_datetime(&timezone)?
      .timestamp_millis();
    let before_timestamp = super::DateTime::from(before_datetime)
      .to_rrule_datetime(&timezone)?
      .timestamp_millis();

    for date in self.rrule_set.into_iter() {
      let date_timestamp = date.timestamp_millis();
      let is_after = self.is_after(date_timestamp, after_timestamp, inclusive);
      let is_before = self.is_before(date_timestamp, before_timestamp, inclusive);

      if is_after && is_before {
        let datetime: i64 = super::DateTime::from(date).into();

        arr.insert(datetime).unwrap();
      } else if !is_before {
        break;
      }
    }

    Ok(arr)
  }

  #[napi]
  pub fn to_string(&self) -> napi::Result<String> {
    Ok(self.rrule_set.to_string())
  }

  #[napi]
  pub fn iter(&self, this: Reference<RRuleSet>, env: Env) -> napi::Result<RRuleSetIter> {
    let iter = this.share_with(env, |set| Ok(set.rrule_set.into_iter()))?;
    Ok(RRuleSetIter { iter })
  }
}

#[napi(iterator)]
pub struct RRuleSetIter {
  iter: SharedReference<RRuleSet, rrule::RRuleSetIter<'static>>,
}

#[napi]
impl Generator for RRuleSetIter {
  type Yield = i64;
  type Next = ();
  type Return = ();

  fn next(&mut self, _next: Option<Self::Next>) -> Option<Self::Yield> {
    self.iter.next().map(|date| {
      let datetime: i64 = super::DateTime::from(date).into();

      datetime
    })
  }
}

fn to_unvalidated(rrule: &rrule::RRule) -> rrule::RRule<rrule::Unvalidated> {
  let by_month = rrule
    .get_by_month()
    .iter()
    .map(|m| chrono::Month::try_from(*m).unwrap())
    .collect::<Vec<_>>();
  let mut unvalidated = rrule::RRule::new(rrule.get_freq())
    .interval(rrule.get_interval())
    .week_start(rrule.get_week_start())
    .by_set_pos(rrule.get_by_set_pos().to_vec())
    .by_month(&by_month)
    .by_month_day(rrule.get_by_month_day().to_vec())
    .by_year_day(rrule.get_by_year_day().to_vec())
    .by_week_no(rrule.get_by_week_no().to_vec())
    .by_weekday(rrule.get_by_weekday().to_vec())
    .by_hour(rrule.get_by_hour().to_vec())
    .by_minute(rrule.get_by_minute().to_vec())
    .by_second(rrule.get_by_second().to_vec());

  if let Some(count) = rrule.get_count() {
    unvalidated = unvalidated.count(count);
  }

  if let Some(until) = rrule.get_until() {
    unvalidated = unvalidated.until(*until);
  }

  unvalidated
}
