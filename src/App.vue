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
            <i class="i-material-symbols-crop-square w-4 h-4"></i>
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

    <!-- 命令列表 -->
    <div class="flex-1 overflow-auto p-4">
      <div class="space-y-2">
        <div
          v-for="(command, index) in commands"
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
      <div v-if="commands.length === 0" class="text-center py-12">
        <i
          class="i-material-symbols-terminal w-12 h-12 text-gray-400 mx-auto mb-4"
        ></i>
        <p class="text-gray-500">还没有添加任何命令</p>
        <p class="text-sm text-gray-400 mt-1">点击右上角"添加命令"按钮开始</p>
      </div>
    </div>

    <!-- 添加/编辑表单模态框 -->
    <div
      v-if="showAddForm || editingCommand"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-lg p-10 w-full max-w-md">
        <h2 class="text-lg font-semibold mb-4">
          {{ editingCommand ? "编辑命令" : "添加命令" }}
        </h2>

        <div class="space-y-4">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

interface Command {
  id: string;
  title: string;
  command: string;
  workingDir?: string;
}

const commands = ref<Command[]>([]);
const showAddForm = ref(false);
const editingCommand = ref<Command | null>(null);
const fileInput = ref<HTMLInputElement>();

const formData = reactive({
  title: "",
  command: "",
  workingDir: "",
});

// 默认示例命令
const defaultCommands: Command[] = [
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
  {
    id: "demo-3",
    title: "网络连接测试",
    command: "ping baidu.com -n 4\necho.\necho 网络测试完成",
    workingDir: "",
  },
];

// 从localStorage加载命令
const loadCommands = () => {
  const saved = localStorage.getItem("cmd-commands");
  if (saved) {
    const savedCommands = JSON.parse(saved);
    commands.value = savedCommands.length > 0 ? savedCommands : defaultCommands;
  } else {
    commands.value = [...defaultCommands];
    saveCommands();
  }
};

// 保存命令到localStorage
const saveCommands = () => {
  localStorage.setItem("cmd-commands", JSON.stringify(commands.value));
};

// 添加或编辑命令
const saveCommand = () => {
  if (!formData.title.trim() || !formData.command.trim()) {
    alert("请填写标题和命令");
    return;
  }

  if (editingCommand.value) {
    // 编辑现有命令
    const index = commands.value.findIndex(
      (cmd) => cmd.id === editingCommand.value!.id
    );
    if (index !== -1) {
      commands.value[index] = {
        ...editingCommand.value,
        title: formData.title.trim(),
        command: formData.command.trim(),
        workingDir: formData.workingDir.trim() || undefined,
      };
    }
  } else {
    // 添加新命令
    commands.value.push({
      id: Date.now().toString(),
      title: formData.title.trim(),
      command: formData.command.trim(),
      workingDir: formData.workingDir.trim() || undefined,
    });
  }

  saveCommands();
  cancelForm();
};

// 取消表单
const cancelForm = () => {
  showAddForm.value = false;
  editingCommand.value = null;
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
  if (confirm("确定要删除这个命令吗？")) {
    commands.value = commands.value.filter((cmd) => cmd.id !== id);
    saveCommands();
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

  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    // 获取文件路径
    const filePath = (file as any).path || file.name;

    if (filePath) {
      // 如果是文件，获取其目录
      const isFile = file.name.includes(".");
      const workingDir = isFile
        ? filePath.substring(0, filePath.lastIndexOf("\\"))
        : filePath;

      commands.value[index].workingDir = workingDir;
      saveCommands();

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
    const exportData = {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      commands: commands.value,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    
    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `cmd-commands-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    // 清理URL对象
    URL.revokeObjectURL(link.href);
    
    alert(`成功导出 ${commands.value.length} 个命令！`);
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
      
      // 验证数据格式
      if (!importData.commands || !Array.isArray(importData.commands)) {
        throw new Error("无效的备份文件格式");
      }
      
      // 验证命令数据结构
      const validCommands = importData.commands.filter((cmd: any) => 
        cmd.id && cmd.title && cmd.command
      );
      
      if (validCommands.length === 0) {
        throw new Error("备份文件中没有有效的命令数据");
      }
      
      // 询问用户是否要合并还是替换
      const shouldReplace = confirm(
        `发现 ${validCommands.length} 个命令。\n\n点击"确定"替换当前所有命令\n点击"取消"将新命令添加到现有命令中`
      );
      
      if (shouldReplace) {
        commands.value = validCommands;
      } else {
        // 合并命令，避免重复ID
        const existingIds = new Set(commands.value.map(cmd => cmd.id));
        const newCommands = validCommands.filter((cmd: Command) => !existingIds.has(cmd.id));
        commands.value = [...commands.value, ...newCommands];
      }
      
      saveCommands();
      alert(`成功导入 ${shouldReplace ? validCommands.length : validCommands.filter((cmd: Command) => !new Set(commands.value.map(c => c.id)).has(cmd.id)).length} 个命令！`);
      
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
  loadCommands();
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
