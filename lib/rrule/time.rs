#[derive(Clone)]
pub struct Time {
  pub hour: u32,
  pub minute: u32,
  pub second: u32,
  pub utc: bool,
}
