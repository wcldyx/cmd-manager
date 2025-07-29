import { app, BrowserWindow, ipcMain, shell, globalShortcut } from 'electron'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

const isDev = !app.isPackaged

let mainWindow: BrowserWindow

// 确保单实例运行
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // 当运行第二个实例时，聚焦到现有窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    frame: false,
    titleBarStyle: 'hidden',
    show: false,
    resizable: true,
    minimizable: true,
    maximizable: true,
    closable: true
  })

  if (isDev) {
    // 先尝试5173，如果失败则尝试5174
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      console.log('Trying port 5174...')
      mainWindow.loadURL('http://localhost:5174').catch(() => {
        console.log('Failed to connect to dev server')
      })
    })
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // 开发模式下启用开发者工具
  if (isDev) {
    // 默认打开开发者工具
    mainWindow.webContents.openDevTools()
    
    // 注册全局快捷键
    
    // F12 切换开发者工具
    globalShortcut.register('F12', () => {
      if (mainWindow) {
        mainWindow.webContents.toggleDevTools()
      }
    })
    
    // Ctrl+Shift+I 切换开发者工具
    globalShortcut.register('CommandOrControl+Shift+I', () => {
      if (mainWindow) {
        mainWindow.webContents.toggleDevTools()
      }
    })
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  // 清理全局快捷键
  globalShortcut.unregisterAll()
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  // 清理全局快捷键
  globalShortcut.unregisterAll()
})

// IPC handlers
ipcMain.handle('execute-command', async (_, command: string, workingDir?: string) => {
  return new Promise((resolve, reject) => {
    try {
      const fs = require('fs')
      const path = require('path')
      const os = require('os')
      
      const cwd = workingDir || process.cwd()
      const commands = command.split('\n').filter(cmd => cmd.trim())
      
      // 创建临时批处理文件
      const tempBatFile = path.join(os.tmpdir(), `cmd-manager-${Date.now()}.bat`)
      const batContent = [
        '@echo off',
        'chcp 65001 >nul',  // 设置UTF-8编码
        `title CMD命令管理器 - 执行中`,
        `cd /d "${cwd}"`,
        'echo ==========================================',
        'echo CMD命令管理器',
        'echo ==========================================',
        'echo 工作目录: %CD%',
        'echo.',
        'echo 执行命令:',
        ...commands.map(cmd => `echo    ^> ${cmd}`),
        'echo.',
        'echo ==========================================',
        'echo.',
        ...commands.map(cmd => [
          `echo 执行: ${cmd}`,
          cmd,
          'echo.'
        ]).flat(),
        'echo ==========================================',
        'echo 所有命令执行完成！',
        'echo.',
        'echo 按任意键关闭窗口...',
        'pause >nul'
      ].join('\r\n')
      
      fs.writeFileSync(tempBatFile, batContent, 'utf8')
      
      // 使用start命令打开新的cmd窗口执行批处理文件
      const child = spawn('cmd', ['/c', `start "CMD命令管理器" cmd /k "${tempBatFile}"`], {
        detached: true,
        stdio: 'ignore',
        shell: true
      })
      
      child.unref()
      
      // 10分钟后删除临时文件
      setTimeout(() => {
        try {
          if (fs.existsSync(tempBatFile)) {
            fs.unlinkSync(tempBatFile)
            console.log('临时文件已清理:', tempBatFile)
          }
        } catch (e) {
          console.log('清理临时文件失败:', e instanceof Error ? e.message : String(e))
        }
      }, 10 * 60 * 1000)
      
      resolve({ success: true })
    } catch (error) {
      console.error('执行命令失败:', error)
      reject(error)
    }
  })
})

// 窗口控制IPC处理程序
ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize()
  }
})

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }
})

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close()
  }
})