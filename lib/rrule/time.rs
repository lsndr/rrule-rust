#[derive(Clone)]
pub struct Time {
  pub hour: u32,
  pub minute: u32,
  pub second: u32,
  pub offset: Option<i32>,
}

impl Time {
  pub fn hour(&self) -> u32 {
    self.hour
  }

  pub fn minute(&self) -> u32 {
    self.minute
  }

  pub fn second(&self) -> u32 {
    self.second
  }

  pub fn offset(&self) -> Option<i32> {
    self.offset
  }
}
