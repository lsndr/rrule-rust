pub trait ToStringArray<V, T>
where
  T: ToString,
  V: Iterator<Item = T>,
{
  fn to_string_array(self) -> String;
}

impl<V, T> ToStringArray<V, T> for V
where
  T: ToString,
  V: Iterator<Item = T>,
{
  fn to_string_array(self) -> String {
    let mut data: Vec<String> = Vec::new();

    for item in self {
      data.push(item.to_string());
    }

    data.join(",")
  }
}
