use indexmap::IndexMap;

use super::{Parameters, Property};
use crate::js::{DateTime, Frequency, NWeekday, RRule, Weekday};
use crate::serialization::to_string_array::ToStringArray;
use crate::serialization::to_vec::ToVec;
use std::str::FromStr;

impl Into<Property> for &RRule {
  fn into(self) -> Property {
    let mut value: IndexMap<String, String> = IndexMap::new();

    if let Ok(freq) = self.frequency() {
      value.insert("FREQ".to_string(), freq.into());
    }

    if let Ok(count) = self.count() {
      if let Some(count) = count {
        value.insert("COUNT".to_string(), count.to_string());
      }
    }

    if let Ok(until) = self.until() {
      if let Some(until) = until {
        let datetime = DateTime::from(until);
        value.insert("UNTIL".to_string(), datetime.into());
      }
    }

    if let Ok(interval) = self.interval() {
      if interval > 1 {
        value.insert("INTERVAL".to_string(), interval.to_string());
      }
    }

    if let Ok(weekstart) = self.weekstart() {
      if weekstart != Weekday::Monday {
        value.insert("WKST".to_string(), weekstart.into());
      }
    }

    if let Ok(by_setpos) = self.by_setpos() {
      if (by_setpos.len() > 0) {
        // TODO: use to_string_array
        let by_month: Vec<String> = by_setpos.iter().map(|month| month.to_string()).collect();
        value.insert("BYSETPOS".to_string(), by_month.join(","));
      }
    }

    if let Ok(by_month) = self.by_month() {
      if (by_month.len() > 0) {
        // TODO: use to_string_array
        let by_month: Vec<String> = by_month.iter().map(|month| month.to_string()).collect();
        value.insert("BYMONTH".to_string(), by_month.join(","));
      }
    }

    if let Ok(by_monthday) = self.by_monthday() {
      if (by_monthday.len() > 0) {
        value.insert(
          "BYMONTHDAY".to_string(),
          by_monthday.iter().to_string_array(),
        );
      }
    }

    if let Ok(by_weekno) = self.by_weekno() {
      if (by_weekno.len() > 0) {
        // TODO: use to_string_array
        let by_weekno: Vec<String> = by_weekno.iter().map(|month| month.to_string()).collect();
        value.insert("BYWEEKNO".to_string(), by_weekno.join(","));
      }
    }

    if let Ok(by_hour) = self.by_hour() {
      if (by_hour.len() > 0) {
        value.insert("BYHOUR".to_string(), by_hour.iter().to_string_array());
      }
    }

    if let Ok(by_minute) = self.by_minute() {
      if (by_minute.len() > 0) {
        value.insert("BYMINUTE".to_string(), by_minute.iter().to_string_array());
      }
    }

    if let Ok(by_second) = self.by_second() {
      if (by_second.len() > 0) {
        value.insert("BYSECOND".to_string(), by_second.iter().to_string_array());
      }
    }

    if let Ok(by_yearday) = self.by_yearday() {
      if (by_yearday.len() > 0) {
        // TODO: use to_string_array
        let by_yearday: Vec<String> = by_yearday.iter().map(|month| month.to_string()).collect();
        value.insert("BYYEARDAY".to_string(), by_yearday.join(","));
      }
    }

    if let Ok(by_weekday) = self.by_weekday() {
      if (by_weekday.len() > 0) {
        let by_weekday: Vec<String> = by_weekday
          .iter()
          .map(|n_weekday| {
            let n_weekday: String = n_weekday.into();

            n_weekday
          })
          .collect();

        value.insert("BYDAY".to_string(), by_weekday.join(","));
      }
    }

    Property::new(
      "RRULE".to_string(),
      IndexMap::new(),
      Parameters::Multiple(value),
    )
  }
}

impl Into<String> for &RRule {
  fn into(self) -> String {
    let property: Property = self.into();

    property.to_string()[6..].to_string()
  }
}

impl TryFrom<Property> for RRule {
  type Error = napi::Error;

  fn try_from(property: Property) -> Result<Self, Self::Error> {
    if property.name() != "RRULE" && property.name() != "EXRULE" {
      return Err(napi::Error::new(
        napi::Status::GenericFailure,
        format!("Invalid property name: {}", property.name()),
      ));
    }

    let value = match property.value() {
      Parameters::Multiple(value) => value,
      Parameters::Single(value) => {
        return Err(napi::Error::new(
          napi::Status::GenericFailure,
          format!("Invalid {}: {}", property.name(), value),
        ))
      }
    };

    let rrule = rrule::RRule::new(rrule::Frequency::Daily);

    let rrule = match value.get("FREQ") {
      Some(value) => {
        let freq = value.parse::<Frequency>().map_err(|err| {
          napi::Error::new(
            napi::Status::GenericFailure,
            format!("Invalid FREQ value: {}", value),
          )
        })?;

        rrule.freq(freq.into())
      }
      None => rrule,
    };

    let rrule = match value.get("INTERVAL") {
      Some(value) => {
        let interval = value.parse::<u16>().map_err(|_| {
          napi::Error::new(
            napi::Status::GenericFailure,
            format!("Invalid INTERVAL value: {}", value),
          )
        })?;

        rrule.interval(interval)
      }
      None => rrule,
    };

    let rrule = match value.get("UNTIL") {
      Some(value) => {
        let until: DateTime = value.parse().map_err(|err| {
          napi::Error::new(
            napi::Status::GenericFailure,
            format!("Invalid UNTIL value: {}", value),
          )
        })?;

        rrule.until(until.to_rrule_datetime(&rrule::Tz::Local(chrono::Local::now().timezone()))?)
      }
      None => rrule,
    };

    let rrule = match value.get("COUNT") {
      Some(value) => {
        let count = value.parse::<u32>().map_err(|_| {
          napi::Error::new(
            napi::Status::GenericFailure,
            format!("Invalid COUNT value: {}", value),
          )
        })?;

        rrule.count(count)
      }
      None => rrule,
    };

    let rrule = match value.get("BYHOUR") {
      Some(value) => {
        let by_hour: Vec<u8> = value.as_str().to_vec().map_err(|err| {
          napi::Error::new(
            napi::Status::GenericFailure,
            format!("Invalid BYHOUR value: {}", value),
          )
        })?;

        rrule.by_hour(by_hour)
      }
      None => rrule,
    };

    let rrule = match value.get("BYMINUTE") {
      Some(value) => {
        let by_minute: Vec<u8> = value.as_str().to_vec().map_err(|_| {
          napi::Error::new(
            napi::Status::GenericFailure,
            format!("Invalid BYMINUTE value: {}", value),
          )
        })?;

        rrule.by_minute(by_minute)
      }
      None => rrule,
    };

    let rrule = match value.get("BYSECOND") {
      Some(value) => {
        let by_second: Vec<u8> = value.as_str().to_vec().map_err(|_| {
          napi::Error::new(
            napi::Status::GenericFailure,
            format!("Invalid BYSECOND value: {}", value),
          )
        })?;

        rrule.by_second(by_second)
      }
      None => rrule,
    };

    let rrule = match value.get("BYMONTH") {
      Some(value) => {
        let by_month: Vec<chrono::Month> = value.as_str().to_vec().map_err(|err| {
          napi::Error::new(
            napi::Status::GenericFailure,
            format!("Invalid BYMONTH value: {}", value),
          )
        })?;

        rrule.by_month(&by_month)
      }
      None => rrule,
    };

    let rrule = match value.get("WKST") {
      Some(value) => {
        let week_start = value.parse::<Weekday>().map_err(|_| {
          napi::Error::new(
            napi::Status::GenericFailure,
            format!("Invalid WKST value: {}", value),
          )
        })?;

        rrule.week_start(week_start.into())
      }
      None => rrule,
    };

    let rrule = match value.get("BYDAY") {
      Some(value) => {
        let week_day: Vec<NWeekday> = value.as_str().to_vec().map_err(|_| {
          napi::Error::new(
            napi::Status::GenericFailure,
            format!("Invalid BYDAY value: {}", value),
          )
        })?;
        let week_day = week_day
          .into_iter()
          .map(|n_weekday| n_weekday.into())
          .collect();

        rrule.by_weekday(week_day)
      }
      None => rrule,
    };

    let rrule = match value.get("BYSETPOS") {
      Some(value) => {
        let by_setpos: Vec<i32> = value.as_str().to_vec().map_err(|err| {
          napi::Error::new(
            napi::Status::GenericFailure,
            format!("Invalid BYSETPOS value: {}", value),
          )
        })?;

        rrule.by_set_pos(by_setpos)
      }
      None => rrule,
    };

    let rrule = match value.get("BYMONTHDAY") {
      Some(value) => {
        let by_monthday: Vec<i8> = value.as_str().to_vec().map_err(|_| {
          napi::Error::new(
            napi::Status::GenericFailure,
            format!("Invalid BYMONTHDAY value: {}", value),
          )
        })?;

        rrule.by_month_day(by_monthday)
      }
      None => rrule,
    };

    let rrule = match value.get("BYYEARDAY") {
      Some(value) => {
        let by_yearday: Vec<i16> = value.as_str().to_vec().map_err(|err| {
          napi::Error::new(
            napi::Status::GenericFailure,
            format!("Invalid BYYEARDAY value: {}", value),
          )
        })?;

        rrule.by_year_day(by_yearday)
      }
      None => rrule,
    };

    let rrule = match value.get("BYWEEKNO") {
      Some(value) => {
        let by_weekno: Vec<i8> = value.as_str().to_vec().map_err(|err| {
          napi::Error::new(
            napi::Status::GenericFailure,
            format!("Invalid BYWEEKNO value: {}", value),
          )
        })?;

        rrule.by_week_no(by_weekno)
      }
      None => rrule,
    };

    Ok(Self::from_rrule(rrule)?)
  }
}

impl FromStr for RRule {
  type Err = napi::Error;

  fn from_str(str: &str) -> Result<Self, Self::Err> {
    let str = if !str.to_uppercase().starts_with("RRULE:") {
      format!("RRULE:{}", str)
    } else {
      str.to_string()
    };

    let property = crate::serialization::Property::from_string(&str)
      .map_err(|e| napi::Error::new(napi::Status::GenericFailure, e))?;

    let rrule = RRule::try_from(property)?;

    Ok(rrule)
  }
}
