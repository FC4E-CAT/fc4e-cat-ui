import { AxiosError } from "axios";
import { ApiServiceErr } from "../types";

export function trimProfileID(id: string): string {
  let res: string;
  if (id.includes("@")) {
    res = id.substring(0, 6) + "..." + id.substring(id.indexOf("@"), id.length);
  } else {
    res = id.substring(0, 6) + "...";
  }
  return res;
}

export function handleBackendError(error: AxiosError) {
  console.error("Backend error", error);
  if (error.response) {
    return error.response.data as ApiServiceErr;
  }
}

export function getUniqueValuesForKey<T>(
  jsonData: T[],
  key: keyof T,
): Array<T[keyof T]> {
  const uniqueValuesSet = new Set<T[keyof T]>();
  if (jsonData !== undefined && jsonData != null) {
    for (const item of jsonData) {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        uniqueValuesSet.add(item[key]);
      }
    }
  }
  return Array.from(uniqueValuesSet.values());
}
