use super::{DateTime, Frequency, Month, NWeekday, Weekday};
use crate::serialization::*;
use chrono::{Datelike, Local, Timelike};
use napi::{bindgen_prelude::Array, Either, Env};
use napi_derive::napi;
use replace_with::replace_with_or_abort;

#[napi(js_name = "RRule")]
pub struct RRule {
  rrule: rrule::RRule<rrule::Unvalidated>,
}

#[napi]
impl RRule {
  #[napi(constructor)]
  pub fn new(frequency: Frequency) -> napi::Result<Self> {
    let rrule = rrule::RRule::new(frequency.into());

    Ok(RRule { rrule })
  }

  #[napi(factory)]
  pub fn create(
    env: Env,
    frequency: Option<Frequency>,
    interval: Option<u16>,
    count: Option<u32>,
    #[napi(ts_arg_type = "(readonly (NWeekday | Weekday)[]) | undefined | null")]
    by_weekday: Option<Vec<Either<NWeekday, Weekday>>>,
    #[napi(ts_arg_type = "(readonly number[]) | undefined | null")] by_hour: Option<Vec<u8>>,
    #[napi(ts_arg_type = "(readonly number[]) | undefined | null")] by_minute: Option<Vec<u8>>,
    #[napi(ts_arg_type = "(readonly number[]) | undefined | null")] by_second: Option<Vec<u8>>,
    #[napi(ts_arg_type = "(readonly number[]) | undefined | null")] by_monthday: Option<Vec<i8>>,
    #[napi(ts_arg_type = "(readonly number[]) | undefined | null")] by_setpos: Option<Vec<i32>>,
    #[napi(ts_arg_type = "(readonly number[]) | undefined | null")] by_month: Option<Array>,
    #[napi(ts_arg_type = "(readonly number[]) | undefined | null")] by_weekno: Option<Vec<i8>>,
    #[napi(ts_arg_type = "(readonly number[]) | undefined | null")] by_yearday: Option<Vec<i16>>,
    weekstart: Option<Weekday>,
    until: Option<i64>,
  ) -> napi::Result<Self> {
    let mut rrule = Self::new(frequency.unwrap_or(Frequency::Daily))?;
    rrule.set_interval(interval.unwrap_or(1))?;
    rrule.set_by_weekday(by_weekday.unwrap_or_else(|| Vec::new()))?;
    rrule.set_by_hour(by_hour.unwrap_or_else(|| Vec::new()))?;
    rrule.set_by_minute(by_minute.unwrap_or_else(|| Vec::new()))?;
    rrule.set_by_second(by_second.unwrap_or_else(|| Vec::new()))?;
    rrule.set_by_monthday(by_monthday.unwrap_or_else(|| Vec::new()))?;
    rrule.set_by_setpos(by_setpos.unwrap_or_else(|| Vec::new()))?;
    rrule.set_by_month(by_month.unwrap_or_else(|| env.create_array(0).unwrap()))?;
    rrule.set_by_weekno(by_weekno.unwrap_or_else(|| Vec::new()))?;
    rrule.set_by_yearday(by_yearday.unwrap_or_else(|| Vec::new()))?;
    rrule.set_weekstart(weekstart.unwrap_or(Weekday::Monday))?;

    if let Some(until) = until {
      rrule.set_until(until)?;
    }

    if let Some(count) = count {
      rrule.set_count(count)?;
    }

    Ok(rrule)
  }

  #[napi(factory, ts_return_type = "RRule")]
  pub fn parse(str: String) -> napi::Result<Self> {
    let str = if !str.to_uppercase().starts_with("RRULE:") {
      format!("RRULE:{}", str)
    } else {
      str
    };

    let property = crate::serialization::Property::from_string(&str)
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    if property.name() != "RRULE" {
      return Err(napi::Error::new(
        napi::Status::GenericFailure,
        format!("Invalid property name: {}", property.name()),
      ));
    }

    let value = if let Parameters::Multiple(params) = property.value() {
      params
    } else {
      return Err(napi::Error::new(
        napi::Status::GenericFailure,
        "Invalid rrule value",
      ));
    };

    let rrule = rrule::RRule::new(rrule::Frequency::Daily);

    let rrule = match value.get("FREQ") {
      Some(value) => {
        let freq = value
          .parse::<Frequency>()
          .map_err(|err| napi::Error::new(napi::Status::GenericFailure, err))?;

        rrule.freq(freq.into())
      }
      None => rrule,
    };

    let rrule = match value.get("INTERVAL") {
      Some(value) => {
        let interval = value
          .parse::<u16>()
          .map_err(|err| napi::Error::new(napi::Status::GenericFailure, err))?;

        rrule.interval(interval)
      }
      None => rrule,
    };

    let rrule = match value.get("UNTIL") {
      Some(value) => {
        let until: DateTime = value
          .parse()
          .map_err(|err| napi::Error::new(napi::Status::GenericFailure, err))?;

        rrule.until(until.to_rrule_datetime(&rrule::Tz::Local(Local::now().timezone()))?)
      }
      None => rrule,
    };

    let rrule = match value.get("COUNT") {
      Some(value) => {
        let count = value
          .parse::<u32>()
          .map_err(|err| napi::Error::new(napi::Status::GenericFailure, err))?;

        rrule.count(count)
      }
      None => rrule,
    };

    let rrule = match value.get("BYHOUR") {
      Some(value) => {
        let by_hour: Vec<u8> = value
          .to_vec()
          .map_err(|err| napi::Error::new(napi::Status::GenericFailure, err))?;

        rrule.by_hour(by_hour)
      }
      None => rrule,
    };

    let rrule = match value.get("BYMINUTE") {
      Some(value) => {
        let by_minute: Vec<u8> = value
          .to_vec()
          .map_err(|err| napi::Error::new(napi::Status::GenericFailure, err))?;

        rrule.by_minute(by_minute)
      }
      None => rrule,
    };

    let rrule = match value.get("BYSECOND") {
      Some(value) => {
        let by_second: Vec<u8> = value
          .to_vec()
          .map_err(|err| napi::Error::new(napi::Status::GenericFailure, err))?;

        rrule.by_second(by_second)
      }
      None => rrule,
    };

    let rrule = match value.get("BYMONTH") {
      Some(value) => {
        let by_month: Vec<chrono::Month> = value
          .to_vec()
          .map_err(|err| napi::Error::new(napi::Status::GenericFailure, err))?;

        rrule.by_month(&by_month)
      }
      None => rrule,
    };

    let rrule = match value.get("WKST") {
      Some(value) => {
        let week_start = value
          .parse::<Weekday>()
          .map_err(|err| napi::Error::new(napi::Status::GenericFailure, err))?;

        rrule.week_start(week_start.into())
      }
      None => rrule,
    };

    let rrule = match value.get("BYDAY") {
      Some(value) => {
        let week_day: Vec<NWeekday> = value
          .to_vec()
          .map_err(|err| napi::Error::new(napi::Status::GenericFailure, err))?;
        let week_day = week_day
          .into_iter()
          .map(|n_weekday| n_weekday.into())
          .collect();

        rrule.by_weekday(week_day)
      }
      None => rrule,
    };

    let rrule = match value.get("WKST") {
      Some(value) => {
        let week_start = value
          .parse::<Weekday>()
          .map_err(|err| napi::Error::new(napi::Status::GenericFailure, err))?;

        rrule.week_start(week_start.into())
      }
      None => rrule,
    };

    let rrule = match value.get("BYSETPOS") {
      Some(value) => {
        let by_setpos: Vec<i32> = value
          .to_vec()
          .map_err(|err| napi::Error::new(napi::Status::GenericFailure, err))?;

        rrule.by_set_pos(by_setpos)
      }
      None => rrule,
    };

    let rrule = match value.get("BYMONTHDAY") {
      Some(value) => {
        let by_monthday: Vec<i8> = value
          .to_vec()
          .map_err(|err| napi::Error::new(napi::Status::GenericFailure, err))?;

        rrule.by_month_day(by_monthday)
      }
      None => rrule,
    };

    let rrule = match value.get("BYYEARDAY") {
      Some(value) => {
        let by_yearday: Vec<i16> = value
          .to_vec()
          .map_err(|err| napi::Error::new(napi::Status::GenericFailure, err))?;

        rrule.by_year_day(by_yearday)
      }
      None => rrule,
    };

    let rrule = match value.get("BYWEEKNO") {
      Some(value) => {
        let by_weekno: Vec<i8> = value
          .to_vec()
          .map_err(|err| napi::Error::new(napi::Status::GenericFailure, err))?;

        rrule.by_week_no(by_weekno)
      }
      None => rrule,
    };

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
  pub fn until(&self) -> napi::Result<Option<i64>> {
    Ok(match self.rrule.get_until() {
      Some(until) => {
        let datetime = super::DateTime::from(*until);
        let datetime: i64 = datetime.into();

        Some(datetime)
      }
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
    #[napi(ts_arg_type = "readonly (NWeekday | Weekday)[]")] weekdays: Vec<
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
    #[napi(ts_arg_type = "readonly number[]")] hours: Vec<u8>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_hour(hours));

    Ok(self)
  }

  #[napi]
  pub fn set_by_minute(
    &mut self,
    #[napi(ts_arg_type = "readonly number[]")] minutes: Vec<u8>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_minute(minutes));

    Ok(self)
  }

  #[napi]
  pub fn set_by_second(
    &mut self,
    #[napi(ts_arg_type = "readonly number[]")] seconds: Vec<u8>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_second(seconds));

    Ok(self)
  }

  #[napi]
  pub fn set_by_monthday(
    &mut self,
    #[napi(ts_arg_type = "readonly number[]")] days: Vec<i8>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_month_day(days));

    Ok(self)
  }

  #[napi]
  pub fn set_by_setpos(
    &mut self,
    #[napi(ts_arg_type = "readonly number[]")] poses: Vec<i32>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_set_pos(poses));

    Ok(self)
  }

  #[napi]
  pub fn set_by_month(
    &mut self,
    #[napi(ts_arg_type = "readonly Month[]")] months: Array,
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
    #[napi(ts_arg_type = "readonly number[]")] week_numbers: Vec<i8>,
  ) -> napi::Result<&Self> {
    replace_with_or_abort(&mut self.rrule, |self_| self_.by_week_no(week_numbers));

    Ok(self)
  }

  #[napi]
  pub fn set_by_yearday(
    &mut self,
    #[napi(ts_arg_type = "readonly number[]")] days: Vec<i16>,
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
  pub fn set_until(&mut self, datetime: i64) -> napi::Result<&Self> {
    let datetime = super::DateTime::from(datetime);
    let datetime: chrono::DateTime<rrule::Tz> =
      datetime.to_rrule_datetime(&rrule::Tz::Local(Local::now().timezone()))?;

    replace_with_or_abort(&mut self.rrule, |self_| self_.until(datetime));

    Ok(self)
  }

  pub fn validate(
    &self,
    dtstart: chrono::DateTime<rrule::Tz>,
  ) -> napi::Result<rrule::RRule<rrule::Validated>> {
    let mut rrule = self.rrule.clone();

    if let Some(until) = rrule.get_until() {
      let until = if until.timezone() == rrule::Tz::LOCAL {
        self.convert_to_timezone(until, dtstart.timezone())
      } else {
        *until
      };

      let datetime = until.with_timezone(&rrule::Tz::UTC);

      rrule = rrule.until(datetime);
    }

    let rrule = rrule
      .validate(dtstart)
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    Ok(rrule)
  }

  fn convert_to_timezone<Tz: chrono::TimeZone>(
    &self,
    datetime: &chrono::DateTime<rrule::Tz>,
    timezone: Tz,
  ) -> chrono::DateTime<Tz> {
    timezone
      .with_ymd_and_hms(
        datetime.year(),
        datetime.month(),
        datetime.day(),
        datetime.hour(),
        datetime.minute(),
        datetime.second(),
      )
      .single()
      .unwrap()
  }
}

impl From<rrule::RRule<rrule::Unvalidated>> for RRule {
  fn from(rrule: rrule::RRule<rrule::Unvalidated>) -> Self {
    Self { rrule }
  }
}
