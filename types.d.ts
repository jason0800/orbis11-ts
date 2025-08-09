//////// type for promise returned for electron main process /////////
interface ElectronPromiseResult {
    success: true | false;
    message: string;
    error?: string;
    data?: any;
}
/////////////////////////////////////////////////////////////////////

////////// types for file and subfolder ////////////////////////////
interface File {
    id: string;
    name: string;
    path: string;
    type: "file";
    size: string;
}

interface Subfolder {
    id: string;
    name: string;
    path: string;
    type: "folder";
}

interface ScannedFolder {
    dirPath: string;
    folderId: string;
    folderName: string;
    files: File[];
    subfolders: Subfolder[];
}
/////////////////////////////////////////////////////////

//////// types for react flow nodes and edges ///////
interface Data {
    dirPath: string;
    label: string;
    files: File[];
    subfolders: Subfolder[];
}

interface Edge {
    id: string,
    source: string,
    target: string,
}
//////////////////////////////////////////////////////////////

////////// type for global electronAPI object ////////////////
interface ElectronAPI {
    selectFolder: () => Promise<ElectronPromiseResult>;
    scanFolder: () => Promise<ScannedFolder>;
    checkFolderExists: (dirPath: string) => Promise<boolean>;
    deleteWorld: (file: string) => Promise<ElectronPromiseResult>;
    saveWorld: (rootPath: string, nodesToSave: FolderNode[], edgesToSave: Edge[]) => Promise<ElectronPromiseResult>;
    scanSavedWorlds: () => Promise<ElectronPromiseResult>;
    copyPath: (dirPath: string) => Promise<ElectronPromiseResult>;
    deleteFolder: (folderPath: string) => Promise<ElectronPromiseResult>;
}

interface Window {
    electronAPI: ElectronAPI;
} 
//////////////////////////////////////////////////////////////