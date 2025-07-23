<template>
  <div class="h-screen bg-gray-50 flex flex-col">
    <!-- 标题栏 -->
    <div class="bg-white border-b px-4 py-3 flex items-center justify-between">
      <h1 class="text-lg font-semibold text-gray-800">CMD命令管理器</h1>
      <button @click="showAddForm = true" class="btn">
        <i class="i-material-symbols-add w-4 h-4"></i>
        添加命令
      </button>
    </div>

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
          @dragenter.prevent
        >
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-gray-900 truncate">{{ command.title }}</h3>
              <p class="text-sm text-gray-600 font-mono mt-1 break-all">{{ command.command }}</p>
              <p v-if="command.workingDir" class="text-xs text-blue-600 mt-1 truncate">
                <i class="i-material-symbols-folder w-3 h-3 inline mr-1"></i>
                {{ command.workingDir }}
              </p>
              <p v-else class="text-xs text-gray-400 mt-1">
                <i class="i-material-symbols-folder w-3 h-3 inline mr-1"></i>
                拖拽文件夹到此处设置工作目录
              </p>
            </div>
            <div class="flex items-center gap-1 ml-3">
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
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="commands.length === 0" class="text-center py-12">
        <i class="i-material-symbols-terminal w-12 h-12 text-gray-400 mx-auto mb-4"></i>
        <p class="text-gray-500">还没有添加任何命令</p>
        <p class="text-sm text-gray-400 mt-1">点击右上角"添加命令"按钮开始</p>
      </div>
    </div>

    <!-- 添加/编辑表单模态框 -->
    <div v-if="showAddForm || editingCommand" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-lg font-semibold mb-4">
          {{ editingCommand ? '编辑命令' : '添加命令' }}
        </h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">标题</label>
            <input
              v-model="formData.title"
              type="text"
              class="input-field w-full"
              placeholder="命令标题"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">命令</label>
            <textarea
              v-model="formData.command"
              class="input-field w-full h-24 resize-none"
              placeholder="输入CMD命令，支持多行"
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">工作目录（可选）</label>
            <input
              v-model="formData.workingDir"
              type="text"
              class="input-field w-full"
              placeholder="命令执行的工作目录"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button @click="cancelForm" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
            取消
          </button>
          <button @click="saveCommand" class="btn">
            {{ editingCommand ? '保存' : '添加' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

interface Command {
  id: string
  title: string
  command: string
  workingDir?: string
}

const commands = ref<Command[]>([])
const showAddForm = ref(false)
const editingCommand = ref<Command | null>(null)

const formData = reactive({
  title: '',
  command: '',
  workingDir: ''
})

// 默认示例命令
const defaultCommands: Command[] = [
  {
    id: 'demo-1',
    title: '查看当前目录',
    command: 'dir',
    workingDir: ''
  },
  {
    id: 'demo-2', 
    title: '查看系统信息',
    command: 'systeminfo | findstr "OS名称 OS版本 系统类型"',
    workingDir: ''
  },
  {
    id: 'demo-3',
    title: '网络连接测试',
    command: 'ping baidu.com -n 4\necho.\necho 网络测试完成',
    workingDir: ''
  }
]

// 从localStorage加载命令
const loadCommands = () => {
  const saved = localStorage.getItem('cmd-commands')
  if (saved) {
    const savedCommands = JSON.parse(saved)
    commands.value = savedCommands.length > 0 ? savedCommands : defaultCommands
  } else {
    commands.value = [...defaultCommands]
    saveCommands()
  }
}

// 保存命令到localStorage
const saveCommands = () => {
  localStorage.setItem('cmd-commands', JSON.stringify(commands.value))
}

// 添加或编辑命令
const saveCommand = () => {
  if (!formData.title.trim() || !formData.command.trim()) {
    alert('请填写标题和命令')
    return
  }

  if (editingCommand.value) {
    // 编辑现有命令
    const index = commands.value.findIndex(cmd => cmd.id === editingCommand.value!.id)
    if (index !== -1) {
      commands.value[index] = {
        ...editingCommand.value,
        title: formData.title.trim(),
        command: formData.command.trim(),
        workingDir: formData.workingDir.trim() || undefined
      }
    }
  } else {
    // 添加新命令
    commands.value.push({
      id: Date.now().toString(),
      title: formData.title.trim(),
      command: formData.command.trim(),
      workingDir: formData.workingDir.trim() || undefined
    })
  }

  saveCommands()
  cancelForm()
}

// 取消表单
const cancelForm = () => {
  showAddForm.value = false
  editingCommand.value = null
  formData.title = ''
  formData.command = ''
  formData.workingDir = ''
}

// 编辑命令
const editCommand = (command: Command) => {
  editingCommand.value = command
  formData.title = command.title
  formData.command = command.command
  formData.workingDir = command.workingDir || ''
}

// 删除命令
const deleteCommand = (id: string) => {
  if (confirm('确定要删除这个命令吗？')) {
    commands.value = commands.value.filter(cmd => cmd.id !== id)
    saveCommands()
  }
}

// 执行命令
const executeCommand = async (command: Command) => {
  try {
    if (window.electronAPI) {
      await window.electronAPI.executeCommand(command.command, command.workingDir)
    } else {
      alert('此功能需要在Electron环境中运行')
    }
  } catch (error) {
    console.error('执行命令失败:', error)
    alert('执行命令失败')
  }
}

// 处理文件夹拖拽
const handleDrop = (event: DragEvent, index: number) => {
  event.preventDefault()
  
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0]
    // 获取文件路径
    const filePath = (file as any).path || file.name
    
    if (filePath) {
      // 如果是文件，获取其目录
      const isFile = file.name.includes('.')
      const workingDir = isFile ? filePath.substring(0, filePath.lastIndexOf('\\')) : filePath
      
      commands.value[index].workingDir = workingDir
      saveCommands()
      
      // 显示成功提示
      const commandItem = document.querySelector(`[data-index="${index}"]`)
      if (commandItem) {
        commandItem.classList.add('border-green-500', 'bg-green-50')
        setTimeout(() => {
          commandItem.classList.remove('border-green-500', 'bg-green-50')
        }, 1000)
      }
    }
  }
}

// 拖拽悬停效果
const handleDragOver = (event: DragEvent, index: number) => {
  event.preventDefault()
  const commandItem = document.querySelector(`[data-index="${index}"]`)
  if (commandItem) {
    commandItem.classList.add('border-blue-500', 'bg-blue-50')
  }
}

const handleDragLeave = (event: DragEvent, index: number) => {
  const commandItem = document.querySelector(`[data-index="${index}"]`)
  if (commandItem) {
    commandItem.classList.remove('border-blue-500', 'bg-blue-50')
  }
}

// 声明window.electronAPI类型
declare global {
  interface Window {
    electronAPI?: {
      executeCommand: (command: string, workingDir?: string) => Promise<any>
    }
  }
}

onMounted(() => {
  loadCommands()
})
</script>