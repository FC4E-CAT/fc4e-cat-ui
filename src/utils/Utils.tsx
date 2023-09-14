import { AxiosError } from "axios";
import { ApiServiceErr } from "../types";

export function trimProfileID(id: string) : string {
    let res: string;
    if (id.includes("@")) {
        res = id.substring(0,6) + "..." + id.substring(id.indexOf("@"), id.length);
    }
    else {
        res = id.substring(0,6) + "...";
    }
    return res;
}

export function handleBackendError(error: AxiosError) {
    console.log("Backend error", error)
    if (error.response) {
      return error.response.data as ApiServiceErr;
    }
}