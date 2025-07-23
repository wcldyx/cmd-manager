import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

const isDev = process.env.NODE_ENV === 'development'

let mainWindow: BrowserWindow

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    titleBarStyle: 'default',
    show: false
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
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
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
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
          console.log('清理临时文件失败:', e.message)
        }
      }, 10 * 60 * 1000)
      
      resolve({ success: true })
    } catch (error) {
      console.error('执行命令失败:', error)
      reject(error)
    }
  })
})