import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import UnoCSS from "unocss/vite";

const alias = {
  "@renderer": resolve("src/renderer/src"),
  "@preload": resolve("src/preload"),
  "@main": resolve("src/main"),
};

export default defineConfig({
  main: {
    resolve: {
      alias,
    },
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    resolve: {
      alias,
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias,
    },
    plugins: [react(), UnoCSS()],
  },
});
