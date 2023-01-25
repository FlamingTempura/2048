import { ChildProcess, spawn } from "child_process";
import * as esbuild from "esbuild";
import { copyFile } from "fs/promises";

async function watchServer() {
  const ctx = await esbuild.context({
    entryPoints: ["server/src/server.ts"],
    outfile: "server/dist/server.js",
    bundle: true,
    plugins: [restartServerPlugin()],
    platform: "node",
  });

  await ctx.watch();
  console.log("Watching for changes...");
}

async function watchClient() {
  const ctx = await esbuild.context({
    entryPoints: ["client/src/App.tsx"],
    outfile: "client/dist/bundle.js",
    bundle: true,
    plugins: [copyAssetsPlugin()],
    platform: "browser",
  });

  await ctx.watch();
  console.log("Watching for changes...");
}

function copyAssetsPlugin(): esbuild.Plugin {
  return {
    name: "Copy assets",
    setup(build) {
      build.onEnd(async () => {
        await copyFile("client/src/www/index.html", "client/dist/index.html");
      });
    },
  };
}

function restartServerPlugin(): esbuild.Plugin {
  return {
    name: "Restart server",
    setup(build) {
      build.onEnd(restartServer);
    },
  };
}

let serverProcess: ChildProcess;
function restartServer(): void {
  if (serverProcess) {
    serverProcess.kill();
  }
  serverProcess = spawn("node", ["./server/dist/server.js"], {
    stdio: "inherit",
  });
}

watchServer();
watchClient();
