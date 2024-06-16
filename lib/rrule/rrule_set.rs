use std::str::FromStr;

use crate::serialization::properties::Properties;

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

  pub fn set_rrules(self, rrules: Vec<RRule>) -> Self {
    Self { rrules, ..self }
  }

  pub fn set_exrules(self, exrules: Vec<RRule>) -> Self {
    Self { exrules, ..self }
  }

  pub fn set_exdates(self, exdates: Vec<ExDate>) -> Self {
    Self { exdates, ..self }
  }

  pub fn set_rdates(self, rdates: Vec<RDate>) -> Self {
    Self { rdates, ..self }
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

  pub fn iterator(&self) -> RRuleSetIterator {
    RRuleSetIterator::new(&self)
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

    Ok(Self {
      dtstart,
      rrules,
      exrules,
      exdates,
      rdates,
    })
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
  rrule_set: rrule::RRuleSet,
}

impl RRuleSetIterator {
  fn new(rrule_set: &RRuleSet) -> Self {
    let rrule_set = rrule_set.to_rrule_set().unwrap();

    Self { rrule_set }
  }
}

impl<'a> IntoIterator for &'a RRuleSetIterator {
  type Item = DateTime;
  type IntoIter = RRuleSetIteratorIterable<'a>;

  fn into_iter(self) -> Self::IntoIter {
    RRuleSetIteratorIterable {
      iter: self.rrule_set.into_iter(),
    }
  }
}

pub struct RRuleSetIteratorIterable<'a> {
  iter: rrule::RRuleSetIter<'a>,
}

impl<'a> Iterator for RRuleSetIteratorIterable<'a> {
  type Item = DateTime;

  fn next(&mut self) -> Option<Self::Item> {
    self.iter.next().map(|date_time| {
      let date_time: DateTime = (&date_time).into();

      date_time
    })
  }
}
