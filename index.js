const electron = require("electron");
const url = require("url");
const path = require("path");
const fs = require("fs");
const console = require("console");

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainwindow;

// listen for app to be ready

app.on("ready", function () {
  mainwindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainwindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  mainwindow.on("closed", function () {
    app.quit();
  });

  //   const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //   Menu.setApplicationMenu(mainMenu);
});

// Main Functions

let mainPath = path.join(process.env.HOME, "Mangas");
const mangas = fs.readdirSync(mainPath, "utf-8");

let mangas_ = mangas.filter((manga) => {
  return fs.statSync(path.join(mainPath, manga)).isDirectory();
});

ipcMain.on("sendManga", function (e, data) {
  e.returnValue = mangas_;
});

// mangaSelected

ipcMain.on("mangaSelected", function (e, data) {
  if (data != "") {
    let chaptersList = fs.readdirSync(path.join(mainPath, data));
    chaptersList = chaptersList.sort(function (a, b) {
      let a_ = a.match(/\d+/g) ? a.match(/\d+/g)[0] : 0;
      let b_ = b.match(/\d+/g) ? b.match(/\d+/g)[0] : 0;

      return a_ - b_;
    });

    let chaptersList_ = chaptersList.filter((chapter) => {
      return fs.statSync(path.join(mainPath, data, chapter)).isDirectory();
    });

    e.returnValue = chaptersList_;
  } else {
    e.returnValue = null;
  }
});

// chapterSelected

ipcMain.on("chapterSelected", function (e, data) {
  let chapterContent = fs.readdirSync(
    path.join(mainPath, data["mangaName"], data["chapterName"])
  );
  e.returnValue = {
    folder: path.join(mainPath, data["mangaName"], data["chapterName"]),
    chapterContent,
  };
});

// creating menu template

const mainMenuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Add item",
      },
      {
        label: "Clear items",
      },
      {
        label: "Quit",
        accelerator: "Ctrl+Q",
        click() {
          app.quit();
        },
      },
    ],
  },
];
