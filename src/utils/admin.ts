export function idToColor(id: string) {
  // generate hash from id
  const hash = Array.from(id).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0,
  );

  // define color palette
  const palette = [
    "#ea7286",
    "#eab281",
    "#e3e19f",
    "#a9c484",
    "#5d937b",
    "#58525a",
    "#a07ca7",
    "#f4a4bf",
    "#f5d1b6",
    "#eeede3",
    "#d6cec2",
    "#a2a6a9",
    "#777f8f",
    "#a3b2d2",
    "#bfded8",
    "#bf796d",
  ];

  // select the color
  return palette[hash % palette.length];
}

// trim the field if it is too big
export function trimField(value: string, length: number) {
  if (value.length > length) {
    return value.slice(0, length) + "...";
  }
  return value;
}
