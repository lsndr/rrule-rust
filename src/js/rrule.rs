use chrono::DateTime;
use napi::{bindgen_prelude::Array, Either, Env};
use replace_with::replace_with_or_abort;

use super::{n_weekday::NWeekday, Frequency, Month, RRuleDateTime, Weekday};

#[napi(js_name = "RRule")]
pub struct RRule {
  rrule: rrule::RRule<rrule::Unvalidated>,
}

#[napi]
impl RRule {
  #[napi(constructor)]
  pub fn new(frequency: Frequency) -> Self {
    let rrule = rrule::RRule::new(frequency.into());

    RRule { rrule }
  }

  #[napi(factory, ts_return_type = "RRule")]
  pub fn parse(str: String) -> napi::Result<Self> {
    let rrule: rrule::RRule<rrule::Unvalidated> = str
      .parse()
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    Ok(RRule { rrule })
  }

  #[napi(getter)]
  pub fn frequency(&self) -> napi::Result<Frequency> {
    Ok(Frequency::from(self.rrule.get_freq()))
  }

  #[napi(getter)]
  pub fn interval(&self) -> napi::Result<u16> {
    Ok(self.rrule.get_interval())
  }

  #[napi(getter)]
  pub fn count(&self) -> napi::Result<Option<u32>> {
    Ok(self.rrule.get_count())
  }

  #[napi(getter, ts_return_type = "NWeekday[]")]
  pub fn by_weekday(&self) -> Vec<NWeekday> {
    return self
      .rrule
      .get_by_weekday()
      .iter()
      .map(|nday| NWeekday::from(*nday))
      .collect();
  }

  #[napi(getter)]
  pub fn by_hour(&self) -> napi::Result<Vec<u8>> {
    Ok(self.rrule.get_by_hour().to_vec())
  }

  #[napi(getter)]
  pub fn by_minute(&self) -> napi::Result<Vec<u8>> {
    Ok(self.rrule.get_by_minute().to_vec())
  }

  #[napi(getter)]
  pub fn by_second(&self) -> napi::Result<Vec<u8>> {
    Ok(self.rrule.get_by_second().to_vec())
  }

  #[napi(getter)]
  pub fn by_monthday(&self) -> napi::Result<Vec<i8>> {
    Ok(self.rrule.get_by_month_day().to_vec())
  }

  #[napi(getter)]
  pub fn by_setpos(&self) -> napi::Result<Vec<i32>> {
    Ok(self.rrule.get_by_set_pos().to_vec())
  }

  #[napi(getter, ts_return_type = "Month[]")]
  pub fn by_month(&self, env: Env) -> napi::Result<Array> {
    let months = self.rrule.get_by_month();
    let mut arr = env.create_array(0)?;

    for month in months.iter() {
      arr.insert(Month::from(month))?;
    }

    Ok(arr)
  }

  #[napi(getter)]
  pub fn by_weekno(&self) -> napi::Result<Vec<i8>> {
    Ok(self.rrule.get_by_week_no().to_vec())
  }

  #[napi(getter)]
  pub fn by_yearday(&self) -> napi::Result<Vec<i16>> {
    Ok(self.rrule.get_by_year_day().to_vec())
  }

  #[napi(getter)]
  pub fn weekstart(&self) -> napi::Result<Weekday> {
    Ok(Weekday::from(self.rrule.get_week_start()))
  }

  #[napi(getter)]
  pub fn until(&self) -> napi::Result<Option<RRuleDateTime>> {
    Ok(match self.rrule.get_until() {
      Some(until) => Some(RRuleDateTime::new_with_date_time(until.clone())),
      None => None,
    })
  }

  #[napi]
  pub fn to_string(&self) -> napi::Result<String> {
    Ok(self.rrule.to_string())
  }

  #[napi]
  pub fn set_interval(&mut self, interval: u16) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.interval(interval));

    Ok(self)
  }

  #[napi]
  pub fn set_count(&mut self, count: u32) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.count(count));

    Ok(self)
  }

  #[napi]
  pub fn set_by_weekday(
    &mut self,
    #[napi(ts_arg_type = "ReadonlyArray<NWeekday | Weekday>")] weekdays: Vec<
      Either<NWeekday, Weekday>,
    >,
  ) -> napi::Result<&Self> {
    let by_weekday = weekdays
      .into_iter()
      .map(|weekday| match weekday {
        Either::A(nday) => nday.into(),
        Either::B(weekday) => rrule::NWeekday::Every(weekday.into()),
      })
      .collect();

    replace_with_or_abort(&mut self.rrule, |self_| self_.by_weekday(by_weekday));

    Ok(self)
  }

  #[napi]
  pub fn set_by_hour(
    &mut self,
    #[napi(ts_arg_type = "ReadonlyArray<number>")] hours: Vec<u8>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_hour(hours));

    Ok(self)
  }

  #[napi]
  pub fn set_by_minute(
    &mut self,
    #[napi(ts_arg_type = "ReadonlyArray<number>")] minutes: Vec<u8>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_minute(minutes));

    Ok(self)
  }

  #[napi]
  pub fn set_by_second(
    &mut self,
    #[napi(ts_arg_type = "ReadonlyArray<number>")] seconds: Vec<u8>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_second(seconds));

    Ok(self)
  }

  #[napi]
  pub fn set_by_monthday(
    &mut self,
    #[napi(ts_arg_type = "ReadonlyArray<number>")] days: Vec<i8>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_month_day(days));

    Ok(self)
  }

  #[napi]
  pub fn set_by_setpos(
    &mut self,
    #[napi(ts_arg_type = "ReadonlyArray<number>")] poses: Vec<i32>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_set_pos(poses));

    Ok(self)
  }

  #[napi]
  pub fn set_by_month(
    &mut self,
    #[napi(ts_arg_type = "ReadonlyArray<Month>")] months: Array,
  ) -> napi::Result<&Self> {
    let mut vec: Vec<chrono::Month> = Vec::new();

    for i in 0..months.len() {
      let month: Month = months.get(i).unwrap().unwrap();

      vec.push(month.into());
    }

    replace_with_or_abort(&mut self.rrule, |self_| self_.by_month(&vec));

    Ok(self)
  }

  #[napi]
  pub fn set_by_weekno(
    &mut self,
    #[napi(ts_arg_type = "ReadonlyArray<number>")] week_numbers: Vec<i8>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_week_no(week_numbers));

    Ok(self)
  }

  #[napi]
  pub fn set_by_yearday(
    &mut self,
    #[napi(ts_arg_type = "ReadonlyArray<number>")] days: Vec<i16>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_year_day(days));

    Ok(self)
  }

  #[napi]
  pub fn set_weekstart(&mut self, day: Weekday) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.week_start(day.into()));

    Ok(self)
  }

  #[napi]
  pub fn set_until(
    &mut self,
    date_time: napi::Either<&RRuleDateTime, napi::JsDate>,
  ) -> napi::Result<&Self> {
    let date_time = RRuleDateTime::from(date_time);
    replace_with_or_abort(&mut self.rrule, |self_| self_.until(date_time.into()));

    Ok(self)
  }

  pub fn validate(&self, dt_start: DateTime<rrule::Tz>) -> napi::Result<rrule::RRule> {
    return Ok(
      self
        .rrule
        .clone()
        .validate(dt_start)
        .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?,
    );
  }
}

impl From<rrule::RRule<rrule::Unvalidated>> for RRule {
  fn from(rrule: rrule::RRule<rrule::Unvalidated>) -> Self {
    Self { rrule }
  }
}
