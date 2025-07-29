<template>
  <div class="h-screen bg-gray-50 flex flex-col">
    <!-- 自定义标题栏 -->
    <div
      class="bg-white border-b px-4 py-2 flex items-center justify-between drag-region"
    >
      <div class="flex items-center gap-3">
        <i class="i-material-symbols-terminal text-blue-600 w-5 h-5"></i>
        <h1 class="text-sm font-medium text-gray-800">CMD命令管理器</h1>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="exportCommands"
          class="btn-icon text-gray-600 hover:bg-gray-100 no-drag"
          title="导出命令"
        >
          <i class="i-material-symbols-download w-4 h-4"></i>
        </button>
        <button
          @click="triggerImport"
          class="btn-icon text-gray-600 hover:bg-gray-100 no-drag"
          title="导入命令"
        >
          <i class="i-material-symbols-upload w-4 h-4"></i>
        </button>
        <button
          @click="showAddForm = true"
          class="btn text-sm px-2 py-1 no-drag"
        >
          <i class="i-material-symbols-add w-4 h-4"></i>
          添加命令
        </button>

        <!-- 窗口控制按钮 -->
        <div class="flex items-center gap-1 ml-2 no-drag">
          <button
            @click="minimizeWindow"
            class="window-btn hover:bg-gray-200"
            title="最小化"
          >
            <i class="i-material-symbols-minimize w-4 h-4"></i>
          </button>
          <button
            @click="maximizeWindow"
            class="window-btn hover:bg-gray-200"
            title="最大化"
          >
            <i class="i-material-symbols-square-outline w-4 h-4"></i>
          </button>
          <button
            @click="closeWindow"
            class="window-btn hover:bg-red-500 hover:text-white"
            title="关闭"
          >
            <i class="i-material-symbols-close w-4 h-4"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入元素 -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      @change="handleFileImport"
      style="display: none;"
    />

    <!-- 主体内容区域：左侧渠道，右侧命令列表 -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 左侧渠道列表 -->
      <div class="w-64 bg-white border-r flex flex-col">
        <div class="p-3 border-b">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-medium text-gray-800 flex items-center gap-2">
              <i class="i-material-symbols-layers w-4 h-4"></i>
              渠道列表
            </h2>
            <button
              @click="showAddChannelForm = true"
              class="btn-icon text-gray-600 hover:bg-gray-100"
              title="添加渠道"
            >
              <i class="i-material-symbols-add w-4 h-4"></i>
            </button>
          </div>
        </div>
        
        <div class="flex-1 overflow-auto">
          <div class="p-2 space-y-1">
            <div
              v-for="channel in channels"
              :key="channel.id"
              class="group relative"
            >
              <div
                @click="selectChannel(channel.id)"
                :class="[
                  'flex items-center justify-between p-2 rounded cursor-pointer transition-all',
                  activeChannelId === channel.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'hover:bg-gray-50 text-gray-700'
                ]"
              >
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <i class="i-material-symbols-folder w-4 h-4 flex-shrink-0"></i>
                  <span class="text-sm truncate">{{ channel.name }}</span>
                  <span class="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                    {{ channel.commands.length }}
                  </span>
                </div>
                
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    @click.stop="editChannel(channel)"
                    class="p-1 hover:bg-blue-100 rounded text-blue-600"
                    title="编辑渠道"
                  >
                    <i class="i-material-symbols-edit w-3 h-3"></i>
                  </button>
                  <button
                    @click.stop="deleteChannel(channel.id)"
                    class="p-1 hover:bg-red-100 rounded text-red-600"
                    title="删除渠道"
                  >
                    <i class="i-material-symbols-delete w-3 h-3"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧命令列表 -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <div class="p-3 bg-white border-b">
          <h2 class="text-sm font-medium text-gray-800">
            {{ activeChannel?.name || '选择渠道' }} - 命令列表
          </h2>
        </div>
        
        <div class="flex-1 overflow-auto p-4">
          <div class="space-y-2">
            <div
              v-for="(command, index) in currentCommands"
              :key="command.id"
              :data-index="index"
              class="bg-white rounded-lg border p-3 hover:shadow-md transition-all duration-200"
              @drop="handleDrop($event, index)"
              @dragover="handleDragOver($event, index)"
              @dragleave="handleDragLeave($event, index)"
              @dragenter="handleDragEnter($event, index)"
            >
              <div>
                <!-- 标题行 -->
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-medium text-gray-900 truncate flex-1 min-w-0 mr-3">
                    {{ command.title }}
                  </h3>
                  <div class="flex items-center gap-1 flex-shrink-0">
                    <button
                      @click="executeCommand(command)"
                      class="btn-icon text-green-600 hover:bg-green-50"
                      title="运行"
                    >
                      <i class="i-material-symbols-play-arrow w-5 h-5"></i>
                    </button>
                    <button
                      @click="editCommand(command)"
                      class="btn-icon text-blue-600 hover:bg-blue-50"
                      title="编辑"
                    >
                      <i class="i-material-symbols-edit w-5 h-5"></i>
                    </button>
                    <button
                      @click="deleteCommand(command.id)"
                      class="btn-icon text-red-600 hover:bg-red-50"
                      title="删除"
                    >
                      <i class="i-material-symbols-delete w-5 h-5"></i>
                    </button>
                  </div>
                </div>
                
                <!-- 命令显示区域 -->
                <p class="text-sm text-gray-600 font-mono mb-2 whitespace-pre-wrap break-words">
                  {{ command.command }}
                </p>
                
                <!-- 工作目录信息 -->
                <p
                  v-if="command.workingDir"
                  class="text-xs text-blue-600 truncate"
                >
                  <i class="i-material-symbols-folder w-3 h-3 inline mr-1"></i>
                  {{ command.workingDir }}
                </p>
                <p v-else class="text-xs text-gray-400">
                  <i class="i-material-symbols-folder w-3 h-3 inline mr-1"></i>
                  拖拽文件夹到此处设置工作目录
                </p>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="!activeChannel" class="text-center py-12">
            <i class="i-material-symbols-layers w-12 h-12 text-gray-400 mx-auto mb-4"></i>
            <p class="text-gray-500">请选择一个渠道</p>
            <p class="text-sm text-gray-400 mt-1">在左侧渠道列表中选择或添加新渠道</p>
          </div>
          
          <div v-else-if="currentCommands.length === 0" class="text-center py-12">
            <i class="i-material-symbols-terminal w-12 h-12 text-gray-400 mx-auto mb-4"></i>
            <p class="text-gray-500">{{ activeChannel.name }} 还没有添加任何命令</p>
            <p class="text-sm text-gray-400 mt-1">点击右上角"添加命令"按钮开始</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑命令表单模态框 -->
    <div
      v-if="showAddForm || editingCommand"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-lg font-semibold mb-4">
          {{ editingCommand ? "编辑命令" : "添加命令" }}
        </h2>

        <div class="space-y-4">
          <!-- 错误信息显示 -->
          <div
            v-if="formError"
            class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm"
          >
            {{ formError }}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >标题</label
            >
            <input
              v-model="formData.title"
              type="text"
              class="input-field w-full"
              placeholder="命令标题"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >命令</label
            >
            <textarea
              v-model="formData.command"
              class="input-field w-full h-24 resize-none"
              placeholder="输入CMD命令，支持多行"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >工作目录（可选）</label
            >
            <input
              v-model="formData.workingDir"
              type="text"
              class="input-field w-full"
              placeholder="命令执行的工作目录"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button
            @click="cancelForm"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            取消
          </button>
          <button @click="saveCommand" class="btn">
            {{ editingCommand ? "保存" : "添加" }}
          </button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑渠道表单模态框 -->
    <div
      v-if="showAddChannelForm || editingChannel"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-lg font-semibold mb-4">
          {{ editingChannel ? "编辑渠道" : "添加渠道" }}
        </h2>

        <div class="space-y-4">
          <!-- 错误信息显示 -->
          <div
            v-if="formError"
            class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm"
          >
            {{ formError }}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >渠道名称</label
            >
            <input
              v-model="channelFormData.name"
              type="text"
              class="input-field w-full"
              placeholder="输入渠道名称"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button
            @click="cancelChannelForm"
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            取消
          </button>
          <button @click="saveChannel" class="btn">
            {{ editingChannel ? "保存" : "添加" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";

interface Command {
  id: string;
  title: string;
  command: string;
  workingDir?: string;
}

interface Channel {
  id: string;
  name: string;
  commands: Command[];
}

const channels = ref<Channel[]>([]);
const activeChannelId = ref<string>('');
const showAddForm = ref(false);
const showAddChannelForm = ref(false);
const editingCommand = ref<Command | null>(null);
const editingChannel = ref<Channel | null>(null);
const fileInput = ref<HTMLInputElement>();
const formError = ref("");

const formData = reactive({
  title: "",
  command: "",
  workingDir: "",
});

const channelFormData = reactive({
  name: "",
});

// 计算属性
const activeChannel = computed(() => 
  channels.value.find(channel => channel.id === activeChannelId.value)
);

const currentCommands = computed(() => 
  activeChannel.value?.commands || []
);

// 默认示例数据
const defaultChannels: Channel[] = [
  {
    id: "default-channel",
    name: "默认渠道",
    commands: [
      {
        id: "demo-1",
        title: "查看当前目录",
        command: "dir",
        workingDir: "",
      },
      {
        id: "demo-2",
        title: "查看系统信息",
        command: 'systeminfo | findstr "OS名称 OS版本 系统类型"',
        workingDir: "",
      },
    ],
  },
  {
    id: "network-channel",
    name: "网络工具",
    commands: [
      {
        id: "demo-3",
        title: "网络连接测试",
        command: "ping baidu.com -n 4\necho.\necho 网络测试完成",
        workingDir: "",
      },
    ],
  },
];

// 从localStorage加载数据
const loadData = () => {
  const saved = localStorage.getItem("cmd-channels");
  if (saved) {
    const savedData = JSON.parse(saved);
    channels.value = savedData.channels && savedData.channels.length > 0 ? savedData.channels : defaultChannels;
    activeChannelId.value = savedData.activeChannelId || (channels.value[0]?.id || '');
  } else {
    // 迁移旧数据
    const oldCommands = localStorage.getItem("cmd-commands");
    if (oldCommands) {
      const commands = JSON.parse(oldCommands);
      channels.value = [{
        id: "migrated-channel",
        name: "导入的命令",
        commands: commands
      }];
      activeChannelId.value = "migrated-channel";
    } else {
      channels.value = [...defaultChannels];
      activeChannelId.value = defaultChannels[0]?.id || '';
    }
    saveData();
  }
};

// 保存数据到localStorage
const saveData = () => {
  localStorage.setItem("cmd-channels", JSON.stringify({
    channels: channels.value,
    activeChannelId: activeChannelId.value
  }));
};

// 渠道管理
const selectChannel = (channelId: string) => {
  activeChannelId.value = channelId;
  saveData();
};

const saveChannel = () => {
  formError.value = "";
  
  if (!channelFormData.name.trim()) {
    formError.value = "请填写渠道名称";
    return;
  }

  if (editingChannel.value) {
    // 编辑现有渠道
    const index = channels.value.findIndex(
      (ch) => ch.id === editingChannel.value!.id
    );
    if (index !== -1) {
      channels.value[index].name = channelFormData.name.trim();
    }
  } else {
    // 添加新渠道
    const newChannel: Channel = {
      id: Date.now().toString(),
      name: channelFormData.name.trim(),
      commands: [],
    };
    channels.value.push(newChannel);
    activeChannelId.value = newChannel.id;
  }

  saveData();
  cancelChannelForm();
};

const editChannel = (channel: Channel) => {
  editingChannel.value = channel;
  channelFormData.name = channel.name;
  showAddChannelForm.value = true;
};

const deleteChannel = (channelId: string) => {
  if (channels.value.length <= 1) {
    alert("至少需要保留一个渠道");
    return;
  }
  
  if (confirm("确定要删除这个渠道及其所有命令吗？")) {
    channels.value = channels.value.filter((ch) => ch.id !== channelId);
    if (activeChannelId.value === channelId) {
      activeChannelId.value = channels.value[0]?.id || '';
    }
    saveData();
  }
};

const cancelChannelForm = () => {
  showAddChannelForm.value = false;
  editingChannel.value = null;
  formError.value = "";
  channelFormData.name = "";
};

// 添加或编辑命令
const saveCommand = () => {
  formError.value = "";
  
  if (!formData.title.trim() || !formData.command.trim()) {
    formError.value = "请填写标题和命令";
    return;
  }

  if (!activeChannel.value) {
    formError.value = "请先选择一个渠道";
    return;
  }

  if (editingCommand.value) {
    // 编辑现有命令
    const index = activeChannel.value.commands.findIndex(
      (cmd) => cmd.id === editingCommand.value!.id
    );
    if (index !== -1) {
      activeChannel.value.commands[index] = {
        ...editingCommand.value,
        title: formData.title.trim(),
        command: formData.command.trim(),
        workingDir: formData.workingDir.trim() || undefined,
      };
    }
  } else {
    // 添加新命令到当前激活的渠道
    activeChannel.value.commands.push({
      id: Date.now().toString(),
      title: formData.title.trim(),
      command: formData.command.trim(),
      workingDir: formData.workingDir.trim() || undefined,
    });
  }

  saveData();
  cancelForm();
};

// 取消表单
const cancelForm = () => {
  showAddForm.value = false;
  editingCommand.value = null;
  formError.value = "";
  formData.title = "";
  formData.command = "";
  formData.workingDir = "";
};

// 编辑命令
const editCommand = (command: Command) => {
  editingCommand.value = command;
  formData.title = command.title;
  formData.command = command.command;
  formData.workingDir = command.workingDir || "";
};

// 删除命令
const deleteCommand = (id: string) => {
  if (confirm("确定要删除这个命令吗？") && activeChannel.value) {
    activeChannel.value.commands = activeChannel.value.commands.filter((cmd) => cmd.id !== id);
    saveData();
  }
};

// 执行命令
const executeCommand = async (command: Command) => {
  try {
    if (window.electronAPI) {
      await window.electronAPI.executeCommand(
        command.command,
        command.workingDir
      );
    } else {
      alert("此功能需要在Electron环境中运行");
    }
  } catch (error) {
    console.error("执行命令失败:", error);
    alert("执行命令失败");
  }
};

// 处理文件夹拖拽
const handleDrop = (event: DragEvent, index: number) => {
  event.preventDefault();

  const commandItem = document.querySelector(
    `[data-index="${index}"]`
  ) as HTMLElement;

  // 清除拖拽悬停效果
  if (commandItem) {
    commandItem.classList.remove(
      "border-2",
      "border-dashed",
      "border-blue-500",
      "bg-blue-50",
      "scale-102",
      "shadow-lg"
    );
    commandItem.style.transform = "";

    // 移除提示文字
    const dropHint = commandItem.querySelector(".drop-hint");
    if (dropHint) {
      dropHint.remove();
    }
  }

  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0 && activeChannel.value) {
    const file = event.dataTransfer.files[0];
    // 获取文件路径
    const filePath = (file as any).path || file.name;

    if (filePath) {
      // 如果是文件，获取其目录
      const isFile = file.name.includes(".");
      const workingDir = isFile
        ? filePath.substring(0, filePath.lastIndexOf("\\"))
        : filePath;

      activeChannel.value.commands[index].workingDir = workingDir;
      saveData();

      // 显示成功提示效果
      if (commandItem) {
        commandItem.classList.add(
          "border-2",
          "border-green-500",
          "bg-green-50",
          "shadow-lg"
        );

        // 添加成功提示
        const successHint = document.createElement("div");
        successHint.className =
          "success-hint absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full z-10 animate-pulse";
        successHint.textContent = "✓ 工作目录已设置";
        commandItem.appendChild(successHint);

        setTimeout(() => {
          commandItem.classList.remove(
            "border-2",
            "border-green-500",
            "bg-green-50",
            "shadow-lg"
          );
          successHint.remove();
        }, 2000);
      }
    }
  }
};

// 拖拽悬停效果
const handleDragOver = (event: DragEvent, index: number) => {
  event.preventDefault();
  const commandItem = document.querySelector(
    `[data-index="${index}"]`
  ) as HTMLElement;
  if (commandItem) {
    commandItem.classList.add(
      "border-2",
      "border-dashed",
      "border-blue-500",
      "bg-blue-50",
      "scale-102",
      "shadow-lg"
    );
    commandItem.style.transform = "scale(1.02)";

    // 添加提示文字
    let dropHint = commandItem.querySelector(".drop-hint");
    if (!dropHint) {
      dropHint = document.createElement("div");
      dropHint.className =
        "drop-hint absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full z-10";
      dropHint.textContent = "释放以设置工作目录";
      commandItem.style.position = "relative";
      commandItem.appendChild(dropHint);
    }
  }
};

const handleDragLeave = (event: DragEvent, index: number) => {
  // 检查是否真的离开了元素（而不是进入子元素）
  const commandItem = document.querySelector(
    `[data-index="${index}"]`
  ) as HTMLElement;
  if (commandItem && !commandItem.contains(event.relatedTarget as Node)) {
    commandItem.classList.remove(
      "border-2",
      "border-dashed",
      "border-blue-500",
      "bg-blue-50",
      "scale-102",
      "shadow-lg"
    );
    commandItem.style.transform = "";

    // 移除提示文字
    const dropHint = commandItem.querySelector(".drop-hint");
    if (dropHint) {
      dropHint.remove();
    }
  }
};

const handleDragEnter = (event: DragEvent, _index: number) => {
  event.preventDefault();
};

// 窗口控制函数
const minimizeWindow = () => {
  if (window.electronAPI) {
    window.electronAPI.minimizeWindow();
  }
};

const maximizeWindow = () => {
  if (window.electronAPI) {
    window.electronAPI.maximizeWindow();
  }
};

const closeWindow = () => {
  if (window.electronAPI) {
    window.electronAPI.closeWindow();
  }
};

// 导出命令
const exportCommands = () => {
  try {
    const totalCommands = channels.value.reduce((sum, ch) => sum + ch.commands.length, 0);
    const exportData = {
      version: "2.0.0",
      timestamp: new Date().toISOString(),
      channels: channels.value,
      activeChannelId: activeChannelId.value,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    
    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `cmd-channels-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    // 清理URL对象
    URL.revokeObjectURL(link.href);
    
    alert(`成功导出 ${channels.value.length} 个渠道，共 ${totalCommands} 个命令！`);
  } catch (error) {
    console.error("导出失败:", error);
    alert("导出失败，请重试");
  }
};

// 触发导入文件选择
const triggerImport = () => {
  fileInput.value?.click();
};

// 处理文件导入
const handleFileImport = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const importData = JSON.parse(content);
      
      // 支持旧版本数据格式（commands数组）
      if (importData.commands && Array.isArray(importData.commands)) {
        const validCommands = importData.commands.filter((cmd: any) => 
          cmd.id && cmd.title && cmd.command
        );
        
        if (validCommands.length === 0) {
          throw new Error("备份文件中没有有效的命令数据");
        }
        
        const shouldReplace = confirm(
          `发现旧版本格式的 ${validCommands.length} 个命令。\n\n点击"确定"创建新渠道导入\n点击"取消"添加到当前渠道`
        );
        
        if (shouldReplace) {
          const newChannel: Channel = {
            id: Date.now().toString(),
            name: "导入的命令",
            commands: validCommands
          };
          channels.value.push(newChannel);
          activeChannelId.value = newChannel.id;
        } else if (activeChannel.value) {
          const existingIds = new Set(activeChannel.value.commands.map(cmd => cmd.id));
          const newCommands = validCommands.filter((cmd: Command) => !existingIds.has(cmd.id));
          activeChannel.value.commands.push(...newCommands);
        }
        
        saveData();
        alert(`成功导入 ${validCommands.length} 个命令！`);
        return;
      }
      
      // 新版本数据格式（channels数组）
      if (!importData.channels || !Array.isArray(importData.channels)) {
        throw new Error("无效的备份文件格式");
      }
      
      const validChannels = importData.channels.filter((ch: any) => 
        ch.id && ch.name && Array.isArray(ch.commands)
      );
      
      if (validChannels.length === 0) {
        throw new Error("备份文件中没有有效的渠道数据");
      }
      
      const totalCommands = validChannels.reduce((sum: number, ch: Channel) => sum + ch.commands.length, 0);
      
      const shouldReplace = confirm(
        `发现 ${validChannels.length} 个渠道，共 ${totalCommands} 个命令。\n\n点击"确定"替换当前所有数据\n点击"取消"合并到现有数据中`
      );
      
      if (shouldReplace) {
        channels.value = validChannels;
        activeChannelId.value = importData.activeChannelId || validChannels[0]?.id || '';
      } else {
        // 合并数据，避免重复ID
        const existingIds = new Set(channels.value.map(ch => ch.id));
        const newChannels = validChannels.filter((ch: Channel) => !existingIds.has(ch.id));
        channels.value.push(...newChannels);
      }
      
      saveData();
      alert(`成功导入 ${shouldReplace ? validChannels.length : validChannels.filter((ch: Channel) => !new Set(channels.value.map(c => c.id)).has(ch.id)).length} 个渠道！`);
      
    } catch (error) {
      console.error("导入失败:", error);
      alert(`导入失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  };
  
  reader.readAsText(file);
  
  // 清空文件输入，允许重复选择同一文件
  target.value = "";
};

onMounted(() => {
  loadData();
});
</script>

<style>
.drag-region {
  -webkit-app-region: drag;
}

.no-drag {
  -webkit-app-region: no-drag;
}

.window-btn {
  @apply p-1.5 rounded inline-flex items-center justify-center transition-colors;
  -webkit-app-region: no-drag;
  width: 30px;
  height: 30px;
}
</style>
