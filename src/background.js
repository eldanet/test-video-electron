'use strict'

import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
const fs = require('fs');
const path = require('path')
import axios from 'axios'

const appPath = app.getPath('appData') +'/test-video-electron/media/';
const localpath = appPath +'crippa_sixty_lx_4k.mp4';
const remotepath = "https://www.ilvideo.live/crippa-app/mp4/crippa-sixty/4k/crippa_sixty_lx_4k.mp4"

async function download() {
	
	if (!fs.existsSync(appPath)) fs.mkdirSync(appPath);

	return axios({
		method: 'get',
		url: remotepath,
		responseType: 'stream',
	}).then(response => {
		const writer = fs.createWriteStream(localpath)
		return new Promise((resolve, reject) => {
			response.data.pipe(writer);
			let error = null;
			writer.on('error', err => {
				error = err.message;
				console.log("ERROR: "+  error)
				writer.close();
				fs.unlink(localpath)
				reject(err);
			});
			writer.on('finish', function() {
				if (writer) writer.end()
				if (!error) {
					console.log('done')
					createWindow()
					resolve(true);
					//fs.rename(tempFile, localpath)
				} else {
					fs.unlink(localpath)
					console.log(error)
				}
			});
		});
	}).catch((error) => {
		console.log(error)
		reject(error)
	});

}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
		fullscreen: true,
    webPreferences: {
      
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })
	win.setMenu(null)

	// protocollo caricamento media file da AppData
  protocol.registerFileProtocol('atom', (request, callback) => {
    //console.log("Get real path: "+ request.url)
    const url = request.url.substr(7)
    //console.log("=> atom: "+ appPath + url)
    callback({ path: appPath + url })
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
	console.log(localpath)
	if (!fs.existsSync(localpath)) {
		console.log("downloading file, please wait...")
		//await downloadFtp()
		await download()
	} else {
		createWindow()
	}
  
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
