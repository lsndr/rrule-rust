use napi_derive::napi;

#[napi(js_name = "getTimezones")]
pub fn get_timezones() -> Vec<&'static str> {
  chrono_tz::TZ_VARIANTS.iter().map(|tz| tz.name()).collect()
}
