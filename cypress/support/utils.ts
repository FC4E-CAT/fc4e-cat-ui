export function getAuthCodeFromLocation(location: string): string | undefined {
  const url = new URL(location);
  const params = url.search.substring(1).split("&");
  for (const param of params) {
    const [key, value] = param.split("=");
    if (key === "code") {
      return value;
    }
  }
}
