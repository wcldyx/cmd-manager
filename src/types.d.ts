declare global {
  interface Window {
    electronAPI: {
      executeCommand: (command: string, workingDir?: string) => Promise<{ success: boolean }>
    }
  }
}

export {}