const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  openFile: (dirPath: string) => ipcRenderer.invoke('open-item', dirPath),
  scanFolder: (dirPath: string) => ipcRenderer.invoke('scan-folder', dirPath),
  copyPath: (dirPath: string) => ipcRenderer.invoke('copy-path', dirPath),
  createFile: (dirPath: string, fileName: string) => ipcRenderer.invoke('create-file', dirPath, fileName),
  deleteFile: (filePath: string) => ipcRenderer.invoke('delete-file', filePath),
  renameFile: (dirPath: string, filePath: string, fileName: string) => ipcRenderer.invoke('rename-file', dirPath, filePath, fileName),
  // dropping items in another folder node
  dropItem: (itemPath: string, nodePath: string, type: string) => ipcRenderer.invoke('drop-item', itemPath, nodePath, type),
  createFolder: (dirPath: string, folderName: string) => ipcRenderer.invoke('create-folder', dirPath, folderName),
  deleteFolder: (folderPath: string) => ipcRenderer.invoke('delete-folder', folderPath),
  renameFolder: (dirPath: string, folderPath: string, folderName: string) => ipcRenderer.invoke('rename-folder', dirPath, folderPath, folderName),
  // saving & loading worlds
  saveWorld: (rootPath: string, nodes, edges) => ipcRenderer.invoke('save-world', rootPath, nodes, edges),
  loadWorld: (file: string) => ipcRenderer.invoke('load-world', file),
  deleteWorld: (file: string) => ipcRenderer.invoke('delete-world', file),
  scanSavedWorlds: () => ipcRenderer.invoke('scan-saved-worlds'),
  // check if folder exists
  checkFolderExists: (dirPath: string) => ipcRenderer.invoke('check-folder-exists', dirPath),
  // paste item
  pasteItem: (clipboardItem: string, destDir: string) => ipcRenderer.invoke('paste-item', clipboardItem, destDir),
})
