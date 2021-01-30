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

let mainPath = "./static/content/Mangas";

const mangas = fs.readdirSync(mainPath, "utf-8");

ipcMain.on("sendManga", function (e, data) {
  e.returnValue = mangas;
});

// mangaSelected

ipcMain.on("mangaSelected", function (e, data) {
  if (data != "") {
    let chaptersList = fs.readdirSync(path.join(mainPath, data));
    chaptersList = chaptersList.sort(function (a, b) {
      let a_;
      let b_;

      if (a.indexOf("Chapter") != -1) {
        if (a.indexOf(":") != -1) {
          a_ = a.substring(a.indexOf("Chapter") + 7, a.indexOf(":"));
        } else {
          a_ = a.substr(a.indexOf("Chapter") + 7);
        }
      } else {
        return false;
      }

      if (b.indexOf("Chapter") != -1) {
        if (b.indexOf(":") != -1) {
          b_ = b.substring(b.indexOf("Chapter") + 7, b.indexOf(":"));
        } else {
          b_ = b.substr(b.indexOf("Chapter") + 7);
        }
      } else {
        return false;
      }

      return a_ - b_;
    });

    e.returnValue = chaptersList;
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
