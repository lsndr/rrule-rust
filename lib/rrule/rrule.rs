use itertools::Itertools;
use std::str::FromStr;

use super::{
  datetime::DateTime, dtstart::DtStart, frequency::Frequency, month::Month, n_weekday::NWeekday,
  weekday::Weekday,
};
use crate::serialization::{
  parameters::Parameters,
  property::{Property, Value},
};

#[derive(Clone)]
pub struct RRule {
  until: Option<DateTime>,
  frequency: Frequency,
  interval: Option<u16>,
  count: Option<u32>,
  weekstart: Option<Weekday>,
  by_day: Vec<NWeekday>,
  by_hour: Vec<u8>,
  by_minute: Vec<u8>,
  by_second: Vec<u8>,
  by_monthday: Vec<i8>,
  by_yearday: Vec<i16>,
  by_setpos: Vec<i32>,
  by_month: Vec<Month>,
  by_weekno: Vec<i8>,
}

impl RRule {
  pub fn new(frequency: Frequency) -> Self {
    Self {
      frequency,
      interval: None,
      count: None,
      until: None,
      weekstart: None,
      by_day: Vec::new(),
      by_hour: Vec::new(),
      by_minute: Vec::new(),
      by_second: Vec::new(),
      by_monthday: Vec::new(),
      by_yearday: Vec::new(),
      by_setpos: Vec::new(),
      by_month: Vec::new(),
      by_weekno: Vec::new(),
    }
  }

  pub fn set_interval(self, interval: Option<u16>) -> Self {
    Self { interval, ..self }
  }

  pub fn set_count(self, count: Option<u32>) -> Self {
    Self { count, ..self }
  }

  pub fn set_until(self, until: Option<DateTime>) -> Self {
    Self { until, ..self }
  }

  pub fn set_by_hour(self, by_hour: Vec<u8>) -> Self {
    Self { by_hour, ..self }
  }

  pub fn set_by_minute(self, by_minute: Vec<u8>) -> Self {
    Self { by_minute, ..self }
  }

  pub fn set_by_second(self, by_second: Vec<u8>) -> Self {
    Self { by_second, ..self }
  }

  pub fn set_by_monthday(self, by_monthday: Vec<i8>) -> Self {
    Self {
      by_monthday,
      ..self
    }
  }

  pub fn set_by_yearday(self, by_yearday: Vec<i16>) -> Self {
    Self { by_yearday, ..self }
  }

  pub fn set_by_setpos(self, by_setpos: Vec<i32>) -> Self {
    Self { by_setpos, ..self }
  }

  pub fn set_by_month(self, by_month: Vec<Month>) -> Self {
    Self { by_month, ..self }
  }

  pub fn set_by_weekno(self, by_weekno: Vec<i8>) -> Self {
    Self { by_weekno, ..self }
  }

  pub fn set_by_day(self, by_day: Vec<NWeekday>) -> Self {
    Self { by_day, ..self }
  }

  pub fn set_weekstart(self, weekstart: Option<Weekday>) -> Self {
    Self { weekstart, ..self }
  }

  pub fn frequency(&self) -> &Frequency {
    &self.frequency
  }

  pub fn interval(&self) -> Option<u16> {
    self.interval
  }

  pub fn count(&self) -> Option<u32> {
    self.count
  }

  pub fn by_day(&self) -> &Vec<NWeekday> {
    &self.by_day
  }

  pub fn by_hour(&self) -> &Vec<u8> {
    &self.by_hour
  }

  pub fn by_minute(&self) -> &Vec<u8> {
    &self.by_minute
  }

  pub fn by_second(&self) -> &Vec<u8> {
    &self.by_second
  }

  pub fn by_monthday(&self) -> &Vec<i8> {
    &self.by_monthday
  }

  pub fn by_yearday(&self) -> &Vec<i16> {
    &self.by_yearday
  }

  pub fn by_setpos(&self) -> &Vec<i32> {
    &self.by_setpos
  }

  pub fn by_month(&self) -> &Vec<Month> {
    &self.by_month
  }

  pub fn by_weekno(&self) -> &Vec<i8> {
    &self.by_weekno
  }

  pub fn weekstart(&self) -> Option<&Weekday> {
    self.weekstart.as_ref()
  }

  pub fn until(&self) -> Option<&DateTime> {
    self.until.as_ref()
  }

  pub fn to_property(&self) -> Property {
    let mut value = Parameters::new();

    value.insert("FREQ".to_string(), self.frequency.to_string());

    if let Some(interval) = self.interval {
      value.insert("INTERVAL".to_string(), interval.to_string());
    }

    if let Some(count) = self.count {
      value.insert("COUNT".to_string(), count.to_string());
    }

    if let Some(until) = &self.until {
      value.insert("UNTIL".to_string(), until.to_string());
    }

    if !self.by_hour.is_empty() {
      value.insert("BYHOUR".to_string(), self.by_hour.iter().join(","));
    }

    if !self.by_minute.is_empty() {
      value.insert("BYMINUTE".to_string(), self.by_minute.iter().join(","));
    }

    if !self.by_second.is_empty() {
      value.insert("BYSECOND".to_string(), self.by_second.iter().join(","));
    }

    if !self.by_monthday.is_empty() {
      value.insert("BYMONTHDAY".to_string(), self.by_monthday.iter().join(","));
    }

    if !self.by_yearday.is_empty() {
      value.insert("BYYEARDAY".to_string(), self.by_yearday.iter().join(","));
    }

    if !self.by_setpos.is_empty() {
      value.insert("BYSETPOS".to_string(), self.by_setpos.iter().join(","));
    }

    if !self.by_month.is_empty() {
      value.insert(
        "BYMONTH".to_string(),
        self
          .by_month
          .iter()
          .map(|month| month.to_string())
          .join(","),
      );
    }

    if !self.by_weekno.is_empty() {
      value.insert("BYWEEKNO".to_string(), self.by_weekno.iter().join(","));
    }

    if !self.by_day.is_empty() {
      value.insert(
        "BYDAY".to_string(),
        self
          .by_day
          .iter()
          .map(|day| Into::<String>::into(day))
          .join(","),
      );
    }

    if let Some(weekstart) = &self.weekstart {
      value.insert("WKST".to_string(), weekstart.into());
    }

    Property::new(
      "RRULE".to_string(),
      Parameters::new(),
      Value::Parameters(value),
    )
  }

  pub fn to_string(&self) -> String {
    self.to_property().to_string()
  }

  pub fn from_str(str: &str) -> Result<Self, String> {
    let str = if !str.to_uppercase().starts_with("RRULE:") {
      format!("RRULE:{}", str)
    } else {
      str.to_string()
    };

    let property: Property = str.parse().map_err(|err| format!("{}", err))?;

    Self::from_property(property)
  }

  fn from_property(property: Property) -> Result<Self, String> {
    if property.name() != "RRULE" && property.name() != "EXRULE" {
      return Err(format!("Invalid property name: {}", property.name()));
    }

    let value = match property.value() {
      Value::Parameters(value) => value,
      Value::Single(value) => return Err(format!("Invalid {}: {}", property.name(), value)),
    };

    let frequency = match value.get_as::<Frequency>("FREQ")? {
      Some(value) => value,
      None => return Err("FREQ is required".to_string()),
    };

    let interval = value.get_as::<u16>("INTERVAL")?;
    let until = value.get_as::<DateTime>("UNTIL")?;
    let count = value.get_as::<u32>("COUNT")?;
    let by_hour = value.get_as_vec::<u8>("BYHOUR")?;
    let by_minute = value.get_as_vec::<u8>("BYMINUTE")?;
    let by_second = value.get_as_vec::<u8>("BYSECOND")?;
    let by_month = value.get_as_vec::<Month>("BYMONTH")?;
    let weekstart = value.get_as::<Weekday>("WKST")?;
    let by_day = value.get_as_vec::<NWeekday>("BYDAY")?;
    let by_setpos = value.get_as_vec::<i32>("BYSETPOS")?;
    let by_monthday = value.get_as_vec::<i8>("BYMONTHDAY")?;
    let by_yearday = value.get_as_vec::<i16>("BYYEARDAY")?;
    let by_weekno = value.get_as_vec::<i8>("BYWEEKNO")?;

    Ok(Self {
      frequency,
      until,
      interval,
      count,
      weekstart,
      by_day: by_day.unwrap_or_default(),
      by_hour: by_hour.unwrap_or_default(),
      by_minute: by_minute.unwrap_or_default(),
      by_second: by_second.unwrap_or_default(),
      by_monthday: by_monthday.unwrap_or_default(),
      by_yearday: by_yearday.unwrap_or_default(),
      by_setpos: by_setpos.unwrap_or_default(),
      by_month: by_month.unwrap_or_default(),
      by_weekno: by_weekno.unwrap_or_default(),
    })
  }
}

impl TryFrom<Property> for RRule {
  type Error = String;

  fn try_from(property: Property) -> Result<Self, Self::Error> {
    Self::from_property(property)
  }
}

impl FromStr for RRule {
  type Err = String;

  fn from_str(str: &str) -> Result<Self, Self::Err> {
    Self::from_str(str)
  }
}

pub trait ToRRule {
  fn to_rrule(&self, tzid: &DtStart) -> Result<rrule::RRule<rrule::Validated>, String>;
}

impl ToRRule for RRule {
  fn to_rrule(&self, dtstart: &DtStart) -> Result<rrule::RRule<rrule::Validated>, String> {
    let mut rrule = rrule::RRule::new((&self.frequency).into());

    rrule = rrule.interval(self.interval.unwrap_or(1));

    if let Some(count) = self.count {
      rrule = rrule.count(count);
    }

    if let Some(until) = &self.until {
      let until = until.to_datetime(dtstart.tzid().unwrap_or(&chrono_tz::Tz::UTC))?;
      let until = until.with_timezone(&rrule::Tz::Tz(chrono_tz::Tz::UTC));

      rrule = rrule.until(until);
    }

    rrule = rrule.by_hour(self.by_hour.clone());
    rrule = rrule.by_minute(self.by_minute.clone());
    rrule = rrule.by_second(self.by_second.clone());
    rrule = rrule.by_month_day(self.by_monthday.clone());
    rrule = rrule.by_set_pos(self.by_setpos.clone());
    rrule = rrule.by_month(
      &self
        .by_month()
        .into_iter()
        .map(|month| month.into())
        .collect::<Vec<chrono::Month>>(),
    );
    rrule = rrule.by_week_no(self.by_weekno.clone());
    rrule = rrule.by_year_day(self.by_yearday.clone());
    rrule = rrule.week_start(self.weekstart.as_ref().unwrap_or_default().into());
    rrule = rrule.by_weekday((&self.by_day).into_iter().map(|day| day.into()).collect());

    let dtstart = dtstart.to_datetime()?;
    let dtstart = dtstart.with_timezone(&rrule::Tz::Tz(dtstart.timezone()));

    Ok(rrule.validate(dtstart).map_err(|err| format!("{}", err))?)
  }
}
