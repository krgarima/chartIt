import { app, ipcMain } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";

const isProd: boolean = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}
let mainWindow;
(async () => {
  await app.whenReady();

  mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
  });

  if (isProd) {
    await mainWindow.loadURL("app://./home.html");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on("window-all-closed", () => {
  app.quit();
});

const fs = require("fs");
const { parse } = require("csv-parse");

ipcMain.handle("fetch-data", async (event) => {
  let stream = fs
    .createReadStream("./public/data.csv")
    .pipe(parse({ delimiter: ",", from_line: 1 }));

  stream.on("readable", async function () {
    let chunk,
      packets_count = 0,
      packets = [];

    while ((chunk = stream.read()) != null) {
      chunk.push(new Date().getTime());
      packets_count++;
      packets.push(chunk);

      if (packets_count == 10) {
        mainWindow.webContents.send("device-data", packets);
        (packets = []), (packets_count = 0);
      }
      await sleep(4);
    }
    mainWindow.webContents.send("fetch-data", "completed");
  });
});

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};
