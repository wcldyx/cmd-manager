declare global {
  interface Window {
    electronAPI?: {
      executeCommand: (command: string, workingDir?: string) => Promise<{ success: boolean }>
      minimizeWindow: () => void
      maximizeWindow: () => void
      closeWindow: () => void
    }
  }
}

export {}