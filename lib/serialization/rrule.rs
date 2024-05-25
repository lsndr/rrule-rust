use super::Parameters;
use crate::js::{DateTime, Frequency, NWeekday, RRule, Weekday};
use crate::serialization::to_vec::ToVec;
use std::str::FromStr;

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
        let interval = value.parse::<u16>().map_err(|_| {
          napi::Error::new(
            napi::Status::GenericFailure,
            format!("Invalid interval: {}", value),
          )
        })?;

        rrule.interval(interval)
      }
      None => rrule,
    };

    let rrule = match value.get("UNTIL") {
      Some(value) => {
        let until: DateTime = value
          .parse()
          .map_err(|err| napi::Error::new(napi::Status::GenericFailure, err))?;

        rrule.until(until.to_rrule_datetime(&rrule::Tz::Local(chrono::Local::now().timezone()))?)
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

    Ok(Self::from_rrule(rrule)?)
  }
}
