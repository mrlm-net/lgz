import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json";

export default defineConfig({
  build: {
    ssr: true,
    lib: {
      formats: ["es"],
      // Could also be a dictionary or array of multiple entry points
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        logger: resolve(__dirname, "src/autoloader.ts"),
        colorizer: resolve(__dirname, "src/colorizer.ts")
      },
      name: pkg.name,
      // the proper extensions will be added
      fileName: pkg.name,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn"t be bundled
      // into your library
      external: ["fs", "node", "yargs", "yargs/helpers"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          "node": "node",
          "fs": "fs",
          "yargs": "yargs",
          "yargs/helpers": "yargs/helpers",
        },
      },
    },
  },
  plugins: [dts({
    rollupTypes: true,
    insertTypesEntry: true,
  })],
})