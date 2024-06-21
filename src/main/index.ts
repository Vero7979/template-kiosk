import { app } from "electron";
import Main, { type InferMainAPI } from "./main";

const main = new Main({
  quit() {
    app.quit();
  },
});

export type MainAPI = InferMainAPI<typeof main>;
export default main;
