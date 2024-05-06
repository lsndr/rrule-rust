use super::RRule;
use chrono::{DateTime, TimeZone};
use napi::bindgen_prelude::Array;
use napi::Env;
use napi_derive::napi;
use replace_with::replace_with_or_abort;

#[napi(js_name = "RRuleSet")]
pub struct RRuleSet {
  rrule_set: rrule::RRuleSet,
  tz: rrule::Tz,
}

#[napi]
impl RRuleSet {
  #[napi(constructor)]
  pub fn new(dtstart: i64, tzid: String) -> Self {
    let tz = Self::map_js_tz(&tzid);
    let date = Self::timestamp_to_date_with_tz(dtstart, &tz);
    let rrule_set = rrule::RRuleSet::new(date);

    RRuleSet { rrule_set, tz }
  }

  fn map_js_tz(tz: &str) -> rrule::Tz {
    let chrono_tz = tz.parse().unwrap();

    rrule::Tz::Tz(chrono_tz)
  }

  fn timestamp_to_date_with_tz(timestamp: i64, tz: &rrule::Tz) -> DateTime<rrule::Tz> {
    rrule::Tz::UTC
      .timestamp_millis_opt(timestamp)
      .unwrap()
      .with_timezone(tz)
  }

  #[napi]
  pub fn set_from_string(&mut self, str: String) -> napi::Result<&Self> {
    let rrule_set = self
      .rrule_set
      .clone()
      .set_from_string(&str)
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    let dtstart = rrule_set.get_dt_start();
    let tz = dtstart.timezone();

    self.rrule_set = rrule_set;
    self.tz = tz;

    Ok(self)
  }

  #[napi(factory, ts_return_type = "RRuleSet")]
  pub fn parse(str: String) -> napi::Result<Self> {
    let rrule_set: rrule::RRuleSet = str
      .parse()
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    let dtstart = rrule_set.get_dt_start();
    let tz = dtstart.timezone();

    Ok(RRuleSet { rrule_set, tz })
  }

  #[napi]
  pub fn to_string(&self) -> napi::Result<String> {
    Ok(self.rrule_set.to_string())
  }

  #[napi]
  pub fn add_rrule(&mut self, js_rrule: &RRule) -> napi::Result<&Self> {
    let dt_start = self.rrule_set.get_dt_start().clone();
    let rrule = js_rrule.validate(dt_start)?;

    replace_with_or_abort(&mut self.rrule_set, |self_| self_.rrule(rrule));

    Ok(self)
  }

  #[napi]
  pub fn add_exrule(&mut self, js_rrule: &RRule) -> napi::Result<&Self> {
    let rrule = js_rrule.validate(*self.rrule_set.get_dt_start())?;

    replace_with_or_abort(&mut self.rrule_set, |self_| self_.exrule(rrule));

    Ok(self)
  }

  #[napi]
  pub fn add_exdate(&mut self, timestamp: i64) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule_set, |self_| {
      self_.exdate(Self::timestamp_to_date_with_tz(timestamp, &self.tz))
    });

    Ok(self)
  }

  #[napi]
  pub fn add_rdate(&mut self, timestamp: i64) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule_set, |self_| {
      self_.rdate(Self::timestamp_to_date_with_tz(timestamp, &self.tz))
    });

    Ok(self)
  }

  #[napi(getter)]
  pub fn dtstart(&self) -> napi::Result<i64> {
    Ok(self.rrule_set.get_dt_start().timestamp_millis())
  }

  #[napi(ts_return_type = "RRule[]")]
  pub fn get_rrules(&self, env: Env) -> Array {
    let mut arr = env.create_array(0).unwrap();
    let rrules = self.rrule_set.get_rrule();

    for rrule in rrules.iter() {
      arr.insert(RRule::from(to_unvalidated(rrule))).unwrap();
    }

    arr
  }

  #[napi(ts_return_type = "RRule[]")]
  pub fn get_exrules(&self, env: Env) -> Array {
    let mut arr = env.create_array(0).unwrap();
    let rrules = self.rrule_set.get_exrule();

    for rrule in rrules.iter() {
      arr.insert(RRule::from(to_unvalidated(rrule))).unwrap();
    }

    arr
  }

  #[napi(ts_return_type = "number[]")]
  pub fn get_exdates(&self, env: Env) -> Array {
    let mut arr = env.create_array(0).unwrap();
    let dates = self.rrule_set.get_exdate();

    for date in dates.iter() {
      arr.insert(date.timestamp_millis()).unwrap();
    }

    arr
  }

  #[napi(ts_return_type = "number[]")]
  pub fn get_rdates(&self, env: Env) -> Array {
    let mut arr = env.create_array(0).unwrap();
    let dates = self.rrule_set.get_rdate();

    for date in dates.iter() {
      arr.insert(date.timestamp_millis()).unwrap();
    }

    arr
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
  pub fn all(&self, env: Env, limit: Option<u32>) -> Array {
    let mut arr = env.create_array(0).unwrap();

    let mut left = match limit {
      Some(number) => number,
      None => 0,
    };

    for date in self.rrule_set.into_iter() {
      if left > 0 {
        left = left - 1;
      } else if limit.is_some() {
        break;
      }

      let timestamp = date.timestamp_millis();
      arr.insert(timestamp).unwrap();
    }

    arr
  }

  #[napi(ts_return_type = "number[]")]
  pub fn between(
    &self,
    env: Env,
    after: i64,
    before: i64,
    inclusive: Option<bool>,
  ) -> napi::Result<Array> {
    let mut arr = env.create_array(0).unwrap();

    for date in self.rrule_set.into_iter() {
      let timestamp = date.timestamp_millis();
      let is_after = self.is_after(timestamp, after, inclusive);
      let is_before = self.is_before(timestamp, before, inclusive);

      if is_after && is_before {
        arr.insert(timestamp).unwrap();
      } else if !is_before {
        break;
      }
    }

    Ok(arr)
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
