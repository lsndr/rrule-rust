use super::{RRule, RRuleDateTime};
use chrono::DateTime;
use napi::{
  bindgen_prelude::{Reference, SharedReference},
  iterator::Generator,
  Env,
};
use napi_derive::napi;
use replace_with::replace_with_or_abort;

#[napi(js_name = "RRuleSet")]
pub struct RRuleSet {
  rrule_set: rrule::RRuleSet,
}

#[napi]
impl RRuleSet {
  #[napi(constructor)]
  pub fn new(dtstart: napi::Either<&RRuleDateTime, napi::JsDate>) -> napi::Result<Self> {
    let rrule_set = rrule::RRuleSet::new(RRuleDateTime::from(dtstart).into());

    Ok(RRuleSet { rrule_set })
  }

  #[napi(factory, ts_return_type = "RRuleSet")]
  pub fn parse(str: String) -> napi::Result<Self> {
    let rrule_set: rrule::RRuleSet = str
      .parse()
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    Ok(RRuleSet { rrule_set })
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
  pub fn add_exdate(
    &mut self,
    date_time: napi::Either<&RRuleDateTime, napi::JsDate>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule_set, |self_| {
      self_.exdate(RRuleDateTime::from(date_time).into())
    });

    Ok(self)
  }

  #[napi]
  pub fn add_rdate(
    &mut self,
    date_time: napi::Either<&RRuleDateTime, napi::JsDate>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule_set, |self_| {
      self_.rdate(RRuleDateTime::from(date_time).into())
    });

    Ok(self)
  }

  #[napi(getter)]
  pub fn dtstart(&self) -> RRuleDateTime {
    RRuleDateTime::new_with_date_time(self.rrule_set.get_dt_start().clone())
  }

  #[napi]
  pub fn get_rrules(&self) -> Vec<RRule> {
    return self
      .rrule_set
      .get_rrule()
      .iter()
      .map(|rrule| RRule::from(to_unvalidated(rrule)))
      .collect();
  }

  #[napi]
  pub fn get_exrules(&self) -> Vec<RRule> {
    return self
      .rrule_set
      .get_exrule()
      .iter()
      .map(|rrule| RRule::from(to_unvalidated(rrule)))
      .collect();
  }

  #[napi]
  pub fn get_exdates(&self) -> Vec<RRuleDateTime> {
    return self
      .rrule_set
      .get_exdate()
      .iter()
      .map(|date| RRuleDateTime::new_with_date_time(date.clone()))
      .collect();
  }

  #[napi]
  pub fn get_rdates(&self) -> Vec<RRuleDateTime> {
    return self
      .rrule_set
      .get_rdate()
      .iter()
      .map(|date| RRuleDateTime::new_with_date_time(date.clone()))
      .collect();
  }

  fn is_after(
    &self,
    timestamp: DateTime<rrule::Tz>,
    after_timestamp: DateTime<rrule::Tz>,
    inclusive: Option<bool>,
  ) -> bool {
    let inclusive = inclusive.unwrap_or(false);

    if inclusive && timestamp < after_timestamp {
      return false;
    } else if !inclusive && timestamp <= after_timestamp {
      return false;
    }

    true
  }

  fn is_before(
    &self,
    timestamp: DateTime<rrule::Tz>,
    before_timestamp: DateTime<rrule::Tz>,
    inclusive: Option<bool>,
  ) -> bool {
    let inclusive = inclusive.unwrap_or(false);

    if inclusive && timestamp > before_timestamp {
      return false;
    } else if !inclusive && timestamp >= before_timestamp {
      return false;
    }

    true
  }

  #[napi]
  pub fn all(&self, limit: Option<u32>) -> Vec<RRuleDateTime> {
    let iter = self.rrule_set.into_iter();
    if let Some(limit) = limit {
      return iter
        .take(limit as usize)
        .map(|date| RRuleDateTime::new_with_date_time(date))
        .collect();
    } else {
      return iter
        .map(|date| RRuleDateTime::new_with_date_time(date))
        .collect();
    }
  }

  #[napi]
  pub fn between(
    &self,
    after: napi::Either<&RRuleDateTime, napi::JsDate>,
    before: napi::Either<&RRuleDateTime, napi::JsDate>,
    inclusive: Option<bool>,
  ) -> napi::Result<Vec<RRuleDateTime>> {
    let _after = RRuleDateTime::from(after).into();
    let _before = RRuleDateTime::from(before).into();
    return Ok(
      self
        .rrule_set
        .into_iter()
        .take_while(|date| {
          let is_before = self.is_before(*date, _before, inclusive);

          is_before
        })
        .filter(|date| {
          let is_after = self.is_after(*date, _after, inclusive);

          is_after
        })
        .map(|date| RRuleDateTime::new_with_date_time(date))
        .collect::<Vec<_>>(),
    );
  }

  #[napi]
  pub fn occurrences(&self, this: Reference<RRuleSet>, env: Env) -> napi::Result<Occurrences> {
    let iter = this.share_with(env, |set| Ok(set.rrule_set.into_iter()))?;
    Ok(Occurrences { iter })
  }
}

#[napi(iterator)]
pub struct Occurrences {
  iter: SharedReference<RRuleSet, rrule::RRuleSetIter<'static>>,
}

#[napi]
impl Generator for Occurrences {
  type Yield = RRuleDateTime;
  type Next = ();
  type Return = ();

  fn next(&mut self, _next: Option<Self::Next>) -> Option<Self::Yield> {
    self
      .iter
      .next()
      .map(|date| RRuleDateTime::new_with_date_time(date))
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
