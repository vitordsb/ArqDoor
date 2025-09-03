import { LogFunc } from "./Interfaces";

export const logFunc: LogFunc = (msg: string) => {
  if (process.env.NODE_ENV_URL !== "production") {
    console.log("Debug: ", msg);
  }
}
