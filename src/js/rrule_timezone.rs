use std::str::FromStr;

#[derive(Debug)]
#[napi(js_name = "RRuleTimezone")]
pub struct RRuleTimezone {
  tz: rrule::Tz,
}

#[napi]
impl RRuleTimezone {
  #[napi(constructor)]
  pub fn new(tz: String) -> napi::Result<Self> {
    Ok(tz.parse()?)
  }

  pub fn new_with_tz(tz: rrule::Tz) -> Self {
    RRuleTimezone { tz }
  }

  /**
   * The name of the timezone. If the timezone is local, it will return "Local".
   */
  #[napi(getter)]
  pub fn name(&self) -> String {
    self.tz.name().to_string()
  }

  #[napi(getter)]
  pub fn is_local(&self) -> bool {
    self.tz.is_local()
  }
}

impl Into<rrule::Tz> for RRuleTimezone {
  fn into(self) -> rrule::Tz {
    self.tz
  }
}

impl FromStr for RRuleTimezone {
  type Err = napi::Error;

  fn from_str(str: &str) -> Result<Self, Self::Err> {
    str
      .parse::<chrono_tz::Tz>()
      .map(|tz| RRuleTimezone {
        tz: rrule::Tz::Tz(tz),
      })
      .map_err(|err| napi::Error::new(napi::Status::GenericFailure, err.to_string()))
  }
}
