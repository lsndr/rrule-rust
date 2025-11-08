use super::{frequency::Frequency, month::Month, n_weekday::NWeekday, weekday::Weekday};
use crate::rrule::{datetime, n_weekday, rrule};
use napi::{bindgen_prelude::Float64Array, Either};
use napi_derive::napi;

#[napi(js_name = "RRule")]
pub struct RRule {
  rrule: rrule::RRule,
}

#[napi]
impl RRule {
  #[napi(constructor)]
  #[allow(clippy::too_many_arguments)]
  pub fn new(
    frequency: Frequency,
    interval: Option<u16>,
    count: Option<u32>,
    weekstart: Option<Weekday>,
    until: Option<Float64Array>,
    #[napi(ts_arg_type = "(readonly (NWeekday | Weekday)[]) | undefined | null")]
    by_weekday: Option<Vec<Either<NWeekday, Weekday>>>,
    #[napi(ts_arg_type = "(readonly number[]) | undefined | null")] by_hour: Option<Vec<u8>>,
    #[napi(ts_arg_type = "(readonly number[]) | undefined | null")] by_minute: Option<Vec<u8>>,
    #[napi(ts_arg_type = "(readonly number[]) | undefined | null")] by_second: Option<Vec<u8>>,
    #[napi(ts_arg_type = "(readonly number[]) | undefined | null")] by_monthday: Option<Vec<i8>>,
    #[napi(ts_arg_type = "(readonly number[]) | undefined | null")] by_setpos: Option<Vec<i32>>,
    #[napi(ts_arg_type = "(readonly number[]) | undefined | null")] by_month: Option<Vec<Month>>,
    #[napi(ts_arg_type = "(readonly number[]) | undefined | null")] by_weekno: Option<Vec<i8>>,
    #[napi(ts_arg_type = "(readonly number[]) | undefined | null")] by_yearday: Option<Vec<i16>>,
  ) -> napi::Result<Self> {
    let mut rrule = rrule::RRule::new(frequency.into());
    rrule = rrule.set_interval(interval);
    rrule = rrule.set_count(count);
    rrule = rrule.set_until(until.map(datetime::DateTime::from));
    rrule = rrule.set_by_hour(by_hour.unwrap_or_default());
    rrule = rrule.set_by_minute(by_minute.unwrap_or_default());
    rrule = rrule.set_by_second(by_second.unwrap_or_default());
    rrule = rrule.set_by_monthday(by_monthday.unwrap_or_default());
    rrule = rrule.set_by_setpos(by_setpos.unwrap_or_default());
    rrule = rrule.set_by_month(
      by_month
        .unwrap_or_default()
        .into_iter()
        .map(|month| month.into())
        .collect(),
    );
    rrule = rrule.set_by_weekno(by_weekno.unwrap_or_default());
    rrule = rrule.set_by_yearday(by_yearday.unwrap_or_default());
    rrule = rrule.set_weekstart(weekstart.map(|weekday| weekday.into()));
    rrule = rrule.set_by_weekday(
      by_weekday
        .unwrap_or_default()
        .into_iter()
        .map(|day| match day {
          Either::A(nday) => nday.into(),
          Either::B(weekday) => n_weekday::NWeekday {
            n: None,
            weekday: weekday.into(),
          },
        })
        .collect(),
    );

    Ok(Self { rrule })
  }

  #[napi(factory, ts_return_type = "RRule")]
  pub fn parse(str: String) -> napi::Result<Self> {
    let rrule = rrule::RRule::from_str(&str)
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    Ok(Self { rrule })
  }

  #[napi(getter)]
  pub fn frequency(&self) -> napi::Result<Frequency> {
    Ok(self.rrule.frequency().into())
  }

  #[napi(getter)]
  pub fn interval(&self) -> napi::Result<Option<u16>> {
    Ok(self.rrule.interval())
  }

  #[napi(getter)]
  pub fn count(&self) -> napi::Result<Option<u32>> {
    Ok(self.rrule.count())
  }

  #[napi(getter, ts_return_type = "NWeekday[]")]
  pub fn by_weekday(&self) -> napi::Result<Vec<NWeekday>> {
    Ok(
      self
        .rrule
        .by_weekday()
        .iter()
        .map(|nday| nday.into())
        .collect(),
    )
  }

  #[napi(getter)]
  pub fn by_hour(&self) -> napi::Result<Vec<u8>> {
    Ok(self.rrule.by_hour().clone())
  }

  #[napi(getter)]
  pub fn by_minute(&self) -> napi::Result<Vec<u8>> {
    Ok(self.rrule.by_minute().clone())
  }

  #[napi(getter)]
  pub fn by_second(&self) -> napi::Result<Vec<u8>> {
    Ok(self.rrule.by_second().clone())
  }

  #[napi(getter)]
  pub fn by_monthday(&self) -> napi::Result<Vec<i8>> {
    Ok(self.rrule.by_monthday().clone())
  }

  #[napi(getter)]
  pub fn by_setpos(&self) -> napi::Result<Vec<i32>> {
    Ok(self.rrule.by_setpos().clone())
  }

  #[napi(getter, ts_return_type = "Month[]")]
  pub fn by_month(&self) -> napi::Result<Vec<Month>> {
    Ok(
      self
        .rrule
        .by_month()
        .iter()
        .map(|month| month.into())
        .collect(),
    )
  }

  #[napi(getter)]
  pub fn by_weekno(&self) -> napi::Result<Vec<i8>> {
    Ok(self.rrule.by_weekno().clone())
  }

  #[napi(getter)]
  pub fn by_yearday(&self) -> napi::Result<Vec<i16>> {
    Ok(self.rrule.by_yearday().clone())
  }

  #[napi(getter)]
  pub fn weekstart(&self) -> napi::Result<Option<Weekday>> {
    Ok(self.rrule.weekstart().map(|weekstart| weekstart.into()))
  }

  #[napi(getter)]
  pub fn until(&self) -> napi::Result<Option<Float64Array>> {
    Ok(self.rrule.until().map(|datetime| datetime.into()))
  }

  #[napi]
  pub fn to_string(&self) -> napi::Result<String> {
    Ok(self.rrule.to_string())
  }
}

impl From<&RRule> for rrule::RRule {
  fn from(val: &RRule) -> Self {
    val.rrule.clone()
  }
}

impl From<rrule::RRule> for RRule {
  fn from(rrule: rrule::RRule) -> Self {
    Self { rrule }
  }
}
