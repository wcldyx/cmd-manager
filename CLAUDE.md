# CMD命令管理器 - AI记忆文档

## 项目概述
这是一个基于Vue 3 + UnoCSS + Electron构建的CMD命令管理工具，具有无边框现代化界面设计。

## 核心功能
1. **CMD命令管理**：添加、编辑、删除命令项
2. **真实CMD执行**：点击运行按钮打开真正的Windows CMD窗口执行命令
3. **多行命令支持**：支持批量执行多行命令
4. **拖拽文件夹功能**：拖拽文件夹到命令项设置工作目录
5. **无边框界面**：自定义标题栏，带窗口控制按钮
6. **数据持久化**：使用localStorage自动保存命令数据

## 技术架构

### 前端技术栈
- **Vue 3** + TypeScript：现代化响应式框架
- **UnoCSS**：原子化CSS框架，提供紧凑高效的样式
- **Vite**：快速构建工具，支持热重载
- **Material Symbols Icons**：图标库

### 桌面应用技术
- **Electron 28**：跨平台桌面应用框架
- **electron-builder**：应用打包工具

## 项目结构
```
cmd-manager/
├── electron/              # Electron主进程和预加载脚本
│   ├── main.ts            # 主进程，处理窗口创建和IPC通信
│   └── preload.ts         # 预加载脚本，暴露安全的API到渲染进程
├── src/                   # Vue应用源码
│   ├── App.vue            # 主组件，包含所有UI和逻辑
│   ├── main.ts            # Vue应用入口点
│   └── types.d.ts         # TypeScript类型声明
├── release/               # 构建输出目录
│   ├── CMD命令管理器 Setup 1.0.0.exe  # 安装包
│   └── win-unpacked/      # 免安装版本
├── dist/                  # Web构建输出
├── dist-electron/         # Electron构建输出
├── package.json           # 项目配置和依赖
├── vite.config.ts         # Vite配置
├── uno.config.ts          # UnoCSS配置
├── tsconfig.json          # TypeScript配置
├── electron-builder.json  # 应用打包配置
└── .gitignore            # Git忽略文件
```

## 关键实现细节

### 1. 无边框窗口实现
- **Electron配置**：`frame: false, titleBarStyle: 'hidden'`
- **自定义标题栏**：Vue组件中实现，支持拖拽移动
- **窗口控制**：最小化、最大化、关闭按钮通过IPC通信控制

### 2. CMD命令执行机制
- **单行命令**：直接使用 `spawn('cmd', ['/k', command])` 执行
- **多行命令**：创建临时批处理文件，然后执行
- **工作目录支持**：支持设置命令执行的工作目录
- **窗口保持**：使用 `/k` 参数保持CMD窗口打开

### 3. 拖拽反馈系统
- **拖拽悬停**：蓝色虚线边框 + 缩放效果 + 提示文字
- **拖拽成功**：绿色边框 + 成功提示，2秒后消失
- **路径处理**：自动检测文件/文件夹并提取正确的工作目录

### 4. 数据持久化
- **存储方式**：localStorage
- **自动保存**：每次增删改操作都自动保存
- **自动恢复**：应用启动时自动加载保存的命令
- **默认示例**：首次启动提供3个示例命令

## IPC通信接口

### electronAPI (preload.ts暴露)
- `executeCommand(command: string, workingDir?: string)`: 执行CMD命令
- `minimizeWindow()`: 最小化窗口
- `maximizeWindow()`: 最大化/还原窗口
- `closeWindow()`: 关闭窗口

### IPC处理器 (main.ts)
- `execute-command`: 处理命令执行请求
- `minimize-window`: 处理窗口最小化
- `maximize-window`: 处理窗口最大化切换
- `close-window`: 处理窗口关闭

## 开发和构建命令

### 开发命令
- `npm run dev`: 启动Vite开发服务器（Web版，端口5173）
- `npm run electron:dev`: 启动完整Electron开发环境
- `npm run preview`: 预览构建结果

### 构建命令
- `npm run build:web`: 构建Web应用
- `npm run build:electron`: 构建Electron应用安装包
- `npm run build`: 完整构建（Web + Electron）

## 配置要点

### 端口配置
- **开发服务器**：5173（如果被占用会自动尝试其他端口）
- **Electron加载**：自动尝试5173和5174端口

### UnoCSS快捷类
- `btn`: 蓝色按钮样式
- `btn-icon`: 图标按钮样式
- `input-field`: 输入框样式
- `window-btn`: 窗口控制按钮样式
- `scale-102`: 缩放效果

### 样式类名约定
- `drag-region`: 可拖拽区域（-webkit-app-region: drag）
- `no-drag`: 不可拖拽区域（-webkit-app-region: no-drag）

## 已知问题和解决方案

### 1. 端口冲突
**问题**：开发服务器端口被占用
**解决**：Electron主进程会自动尝试多个端口

### 2. 进程残留
**问题**：开发时可能出现Electron进程残留
**解决**：使用任务管理器手动结束electron.exe进程

### 3. 白屏问题
**问题**：开发模式下可能出现白屏
**解决**：确保开发服务器正常启动，检查控制台错误信息

## 部署说明

### 安装版本
位置：`release/CMD命令管理器 Setup 1.0.0.exe`
特点：标准Windows安装程序，支持卸载

### 免安装版本
位置：`release/win-unpacked/CMD命令管理器.exe`
特点：直接运行，无需安装

## 用户使用指南

### 基本操作
1. **添加命令**：点击右上角"添加命令"按钮
2. **运行命令**：点击绿色运行图标
3. **编辑命令**：点击蓝色编辑图标
4. **删除命令**：点击红色删除图标
5. **设置工作目录**：拖拽文件夹到命令项

### 高级功能
- **多行命令**：在命令输入框中换行输入
- **工作目录**：显示当前设置的工作目录路径
- **拖拽反馈**：拖拽时有视觉反馈效果

## 更新历史
- v1.0.0 (2025-07-23): 首次发布，完整功能实现

## AI开发注意事项
1. 修改端口配置时需要同步更新 vite.config.ts、package.json、main.ts
2. 添加新的IPC通信需要在 main.ts、preload.ts、types.d.ts 三处同步
3. 样式修改主要在 App.vue 和 uno.config.ts
4. 窗口控制逻辑在 main.ts 的 IPC 处理器中
5. 命令执行逻辑使用 Node.js 的 spawn 和临时文件机制