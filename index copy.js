const electron = require("electron");
const url = require("url");
const path = require("path");
const fs = require("fs");
const console = require("console");
const { Console } = require("console");

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainwindow;
let pdfindow;

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

  // const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Menu.setApplicationMenu(mainMenu);
});

let openPdf = () => {
  pdfindow = new BrowserWindow({
    width: 700,
    height: 700,
    // frame : false,
    webPreferences: {
      plugins: true,
    },
  });

  pdfindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.pdf"),
      protocol: "file:",
      slashes: true,
    })
  );

  pdfindow.on("closed", function () {
    pdfindow == null;
  });
};

// Main Functions

if (!fs.existsSync("./static/content/Mangas/img")) {
  fs.mkdirSync("./static/content/Mangas/img", { recursive: true });
}

let mainPath2 = "./static/content/Mangas/";

let mangas_2 = [];
if (fs.readdirSync(mainPath2, "utf-8")) {
  for (
    let index = 0;
    index < fs.readdirSync(mainPath2, "utf-8").length;
    index++
  ) {
    const element = fs.readdirSync(mainPath2, "utf-8")[index];
    if (element) {
      mangas_2.push({
        data: fs.readdirSync(path.join(mainPath2, element), "utf-8"),
        type: element,
      });
    }
  }
}
// console.log(mangas_2);

// ----------------------------------------------------

// if (!fs.existsSync("./static/content/Mangas/img")) {
//   fs.mkdirSync("./static/content/Mangas/img", { recursive: true });
// }
// let mainPath = "./static/content/Mangas/img";

// let mangas = fs.readdirSync(mainPath, "utf-8");

if (mangas_2) {
  ipcMain.on("sendManga", function (e, data) {
    e.returnValue = mangas_2;
  });
}

// mangaSelected

ipcMain.on("mangaSelected", function (e, data) {
  if (data != "") {
    let chaptersList = fs.readdirSync(path.join(mainPath, data));
    let sanitizeName = (list, paths) => {
      list.forEach((folder, i) => {
        if (folder.includes("?")) {
          // console.log(folder);
          let newName = folder.replace(/\?/g, "");
          fs.renameSync(paths + "/" + folder, paths + "/" + newName);
          chaptersList[i] = newName;
        }
      });
    };

    (async () => {
      await sanitizeName(chaptersList, path.join(mainPath, data));
    })();

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
  {
    label: "Display Pdf",
    click() {
      openPdf();
    },
  },
];
