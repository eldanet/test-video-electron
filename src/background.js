'use strict'

import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
const fs = require('fs');
const path = require('path')

const appPath = app.getPath('appData') +'/test-video-electron/media/';
const localpath = appPath +'crippa_sixty_lx_4k.mp4';
const remotepath = "/www.ilvideo.live/crippa-app/mp4/crippa-sixty/4k/crippa_sixty_lx_4k.mp4"

// FTP download
const FTP = require('basic-ftp');
let CLIENT = new FTP.Client();
let arrFiles = [];
let arrFolders = [];
let arrErrors = [];
let filesToUpload = 0
let uploadIndex = 0
let stopped = false
let firstTry = true
let ftpOptions = {
	host: "ftp.ilvideo.live",
	user: "8006402@aruba.it",
	password: "Pippo-5050Coe",
	secure: true,
	secureOptions: { rejectUnauthorized: false }
}

async function connectFtp() {

	let error = null;
	console.log('Connection to server...')

	try {
		if (!CLIENT.closed) CLIENT.close();
		CLIENT.ftp.verbose = true
		
		await CLIENT.access(ftpOptions)
		console.log('*** Connected to server ***')
	}
	catch(err) {
		error = err.message;
		console.log('### Connection error: '+ error)
		return null
	}

}

async function disconnectFtp() {
	
	console.log('**** STOP DOWNLOAD *** Disconnection from server...')

	try {
		if (!CLIENT.closed) await CLIENT.close();
		console.log('**** Disconnected from server ***')
		return true
	}
	catch(err) {
		console.log('### Disconnection error: '+ err.message)
		return false
	}

}

async function downloadFile() {
	
	if (!fs.existsSync(appPath)) fs.mkdirSync(appPath);

	try {
		await CLIENT.downloadTo(localpath, remotepath)
		createWindow()
		return true
	}
	catch(err) {
		console.log("### downloadFile error: "+ err.message)
		return false
	}
}

async function downloadFtp() {
	
	try {
		if (CLIENT.closed) {
			connectFtp().then((result) => {
				downloadFile()
			})
		} else {
			downloadFile()
		}
		return true
	}
	catch(err) {
		console.log('### Download FTP error: '+ err.message)
		return null
	}

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
    console.log("=> atom: "+ appPath + url)
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
		console.log("download file")
		await downloadFtp()
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
