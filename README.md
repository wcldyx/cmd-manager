# CMD命令管理工具

基于 Vue 3 + UnoCSS + Electron 构建的CMD命令管理工具。

## 功能特性

- ✅ 命令列表管理：添加、编辑、删除CMD命令
- ✅ 紧凑界面设计：优化列表显示，可查看更多项目
- ✅ CMD命令执行：点击运行按钮执行命令，支持多行命令
- ✅ 命令窗口保持：执行窗口不会自动关闭
- ✅ 拖拽文件夹支持：拖拽文件夹到命令项设置工作目录
- ✅ 数据持久化：使用localStorage保存命令数据

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **CSS框架**: UnoCSS
- **桌面应用**: Electron
- **构建工具**: Vite
- **图标库**: Material Symbols

## 开发和运行

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run electron:dev
```

### 构建应用
```bash
npm run build
```

## 使用说明

1. **添加命令**：点击右上角"添加命令"按钮
2. **编辑命令**：点击命令项右侧的编辑图标
3. **运行命令**：点击命令项右侧的运行图标
4. **删除命令**：点击命令项右侧的删除图标
5. **设置工作目录**：拖拽文件夹到命令项上

## 项目结构

```
cmd-manager/
├── electron/           # Electron主进程和预加载脚本
│   ├── main.ts         # 主进程
│   └── preload.ts      # 预加载脚本
├── src/                # Vue应用源码
│   ├── App.vue         # 主组件
│   ├── main.ts         # 应用入口
│   └── types.d.ts      # 类型声明
├── package.json        # 项目配置
├── vite.config.ts      # Vite配置
├── uno.config.ts       # UnoCSS配置
└── tsconfig.json       # TypeScript配置
```