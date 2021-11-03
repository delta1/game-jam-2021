import esbuildServe from "esbuild-serve";

esbuildServe(
  {
    // esbuild options
    logLevel: "info",
    entryPoints: ["src/game.ts"],
    bundle: true,
    outfile: "dist/game.js",
  },
  {
    // serve options (optional)
    port: 7000,
    root: "dist",
  }
);
