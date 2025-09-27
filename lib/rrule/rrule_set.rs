use std::str::FromStr;

use crate::{rrule::value_type::ValueType, serialization::properties::Properties};

use super::{
  calendar::Calendar,
  datetime::DateTime,
  dtstart::DtStart,
  exdate::ExDate,
  rdate::RDate,
  rrule::{RRule, ToRRule},
};

#[derive(Clone)]
pub struct RRuleSet {
  dtstart: DtStart,
  rrules: Vec<RRule>,
  exrules: Vec<RRule>,
  exdates: Vec<ExDate>,
  rdates: Vec<RDate>,
}

impl RRuleSet {
  pub fn new(dtstart: DtStart) -> Self {
    Self {
      dtstart,
      rrules: Vec::new(),
      exrules: Vec::new(),
      exdates: Vec::new(),
      rdates: Vec::new(),
    }
  }

  pub fn dtstart(&self) -> &DtStart {
    &self.dtstart
  }

  pub fn rrules(&self) -> &Vec<RRule> {
    &self.rrules
  }

  pub fn exrules(&self) -> &Vec<RRule> {
    &self.exrules
  }

  pub fn exdates(&self) -> &Vec<ExDate> {
    &self.exdates
  }

  pub fn rdates(&self) -> &Vec<RDate> {
    &self.rdates
  }

  pub fn set_rrules(self, rrules: Vec<RRule>) -> Result<Self, String> {
    self.verify_rrules(&rrules)?;

    Ok(Self { rrules, ..self })
  }

  pub fn set_exrules(self, exrules: Vec<RRule>) -> Result<Self, String> {
    self.verify_rrules(&exrules)?;

    Ok(Self { exrules, ..self })
  }

  pub fn set_exdates(self, exdates: Vec<ExDate>) -> Result<Self, String> {
    for exdate in exdates.iter() {
      if let Some(vt) = exdate.derive_value_type() {
        if self.dtstart().derive_value_type() != vt {
          return Err("EXDATE value type does not match DTSTART value type".to_string());
        }
      }
    }

    Ok(Self { exdates, ..self })
  }

  pub fn set_rdates(self, rdates: Vec<RDate>) -> Result<Self, String> {
    for rdate in rdates.iter() {
      if let Some(vt) = rdate.derive_value_type() {
        if self.dtstart().derive_value_type() != vt {
          return Err("RDATE value type does not match DTSTART value type".to_string());
        }
      }
    }

    Ok(Self { rdates, ..self })
  }

  pub fn set_from_string(mut self, str: &str) -> Result<Self, String> {
    let calendar: Calendar = str.parse()?;
    let (calendar_dtstarts, calendar_rrules, calendar_exrules, calendar_exdates, calendar_rdates) =
      calendar.into();

    if calendar_dtstarts.len() > 1 {
      return Err("Only one DTSTART is allowed".to_string());
    }

    if let Some(dtstart) = calendar_dtstarts.first() {
      self.dtstart = dtstart.clone();
    }

    for rrule in calendar_rrules {
      self.rrules.push(rrule);
    }

    for rrule in calendar_exrules {
      self.exrules.push(rrule);
    }

    for exdate in calendar_exdates {
      self.exdates.push(exdate);
    }

    for rdate in calendar_rdates {
      self.rdates.push(rdate);
    }

    Ok(self)
  }

  pub fn to_string(&self) -> String {
    self.to_properties().to_string()
  }

  pub fn to_properties(&self) -> Properties {
    let mut properties = Properties::new();

    properties.push(self.dtstart.to_property());

    for rrule in self.rrules.iter() {
      properties.push(rrule.to_property());
    }

    for exrule in self.exrules.iter() {
      properties.push(exrule.to_property());
    }

    for exdate in self.exdates.iter() {
      properties.push(exdate.to_property());
    }

    for rdate in self.rdates.iter() {
      properties.push(rdate.to_property());
    }

    properties
  }

  pub fn iterator(&self) -> Result<RRuleSetIterator, String> {
    Ok(RRuleSetIterator {
      value_type: self.dtstart.derive_value_type(),
      iter: self.to_rrule_set()?.into_iter(),
    })
  }

  pub fn from_str(str: &str) -> Result<Self, String> {
    let calendar: Calendar = str.parse()?;
    let (calendar_dtstarts, calendar_rrules, calendar_exrules, calendar_exdates, calendar_rdates) =
      calendar.into();

    if calendar_dtstarts.len() > 1 {
      return Err("Only one DTSTART is allowed".to_string());
    }

    let dtstart: Option<DtStart> = calendar_dtstarts.into_iter().nth(0);
    let mut rrules: Vec<RRule> = Vec::new();
    let mut exrules: Vec<RRule> = Vec::new();
    let mut exdates: Vec<ExDate> = Vec::new();
    let mut rdates: Vec<RDate> = Vec::new();

    let dtstart = match dtstart {
      Some(value) => value,
      None => {
        return Err("DTSTART is required".to_string());
      }
    };

    for rrule in calendar_rrules {
      rrules.push(rrule);
    }

    for exrule in calendar_exrules {
      exrules.push(exrule);
    }

    for exdate in calendar_exdates {
      exdates.push(exdate);
    }

    for rdate in calendar_rdates {
      rdates.push(rdate);
    }

    Ok(
      Self::new(dtstart)
        .set_exdates(exdates)?
        .set_rdates(rdates)?
        .set_rrules(rrules)?
        .set_exrules(exrules)?,
    )
  }

  fn verify_rrules(&self, rrules: &Vec<RRule>) -> Result<(), String> {
    for rrule in rrules.iter() {
      if let Some(until) = rrule.until() {
        if until.derive_value_type() != self.dtstart().derive_value_type() {
          return Err("RRULE UNTIL value type does not match DTSTART value type".to_string());
        }
      }
    }

    Ok(())
  }
}

impl FromStr for RRuleSet {
  type Err = String;

  fn from_str(str: &str) -> Result<Self, Self::Err> {
    Self::from_str(str)
  }
}

pub trait ToRRuleSet {
  fn to_rrule_set(&self) -> Result<rrule::RRuleSet, String>;
}

impl ToRRuleSet for RRuleSet {
  fn to_rrule_set(&self) -> Result<rrule::RRuleSet, String> {
    let dtstart = self.dtstart.to_datetime()?;
    let dtstart = dtstart.with_timezone(&rrule::Tz::Tz(dtstart.timezone()));

    let mut rrule_set = rrule::RRuleSet::new(dtstart);

    for rrule in self.rrules.iter() {
      rrule_set = rrule_set.rrule(rrule.to_rrule(self.dtstart())?);
    }

    for exrule in self.exrules.iter() {
      rrule_set = rrule_set.exrule(exrule.to_rrule(self.dtstart())?);
    }

    for exdate in self.exdates.iter() {
      let datetimes = exdate.to_datetimes(&self.dtstart)?;

      for datetime in datetimes.into_iter() {
        rrule_set = rrule_set.exdate(datetime.with_timezone(&rrule::Tz::Tz(datetime.timezone())));
      }
    }

    for rdate in self.rdates.iter() {
      let datetimes = rdate.to_datetimes(&self.dtstart)?;

      for datetime in datetimes.into_iter() {
        rrule_set = rrule_set.rdate(datetime.with_timezone(&rrule::Tz::Tz(datetime.timezone())));
      }
    }

    Ok(rrule_set)
  }
}

pub struct RRuleSetIterator {
  value_type: ValueType,
  iter: rrule::RRuleSetIter,
}

impl<'a> Iterator for RRuleSetIterator {
  type Item = DateTime;

  fn next(&mut self) -> Option<Self::Item> {
    self.iter.next().map(|date_time| {
      let date_time: DateTime = (&date_time).into();

      if self.value_type == ValueType::Date {
        DateTime {
          time: None,
          ..date_time
        }
      } else {
        date_time
      }
    })
  }
}
