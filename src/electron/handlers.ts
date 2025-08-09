import { ipcMain, dialog, shell, clipboard, app } from 'electron';
import process from 'process';
import fs from 'fs-extra';
import path from 'path';
import { scanFolder } from './util.js';

export function handlers() {
    ipcMain.handle('select-folder', () => {
        try {
            const folderPathArr = dialog.showOpenDialogSync({ properties: ['openDirectory'] });
            if (folderPathArr) {
            const data = scanFolder(folderPathArr[0]);
            return { success: true, message: 'Scanned folder', data };
            } else {
            return { success: false, message: 'Cancelled by user' };
            }
        } catch (err) {
            console.error(err);
            return { success: false, message: 'Error scanning folder', error: err.message };
        }
    });

    ipcMain.handle('open-item', async (event, dirPath) => {
        try {
            const result = await shell.openPath(dirPath);
            if (result) {
            console.error('Error opening file:', result);
            }
        } catch (err) {
            console.error('Failed to open file:', err);
        }
    })

    ipcMain.handle('scan-folder', (event, dirPath) => {
        try {
            const data = scanFolder(dirPath)
            return { success: true, data: data }
        } catch (err) {
            console.error(err)
            return { success: false, message: "Error scanning folder" }
        }
    })

    // copy path to clipboard handler
    ipcMain.handle('copy-path', (event, itemPath) => {
        try {
            if (!fs.existsSync(itemPath)) {
                return { success: false, message: "Item does not exist" }
            }
            clipboard.writeText(itemPath)
            return { success: true, message: "Path copied" }
        } catch (err) {
            console.error(err)
            return { success: false, message: "Error copying path" }
        }
    })

    // create file handler
    ipcMain.handle('create-file', (event, dirPath, fileName) => {
        const fileToWrite = path.join(dirPath, fileName);
        const isWindows = process.platform === 'win32';
        const invalidChars = isWindows ? /[\\/:*?"<>|]/ : /\//;
        
        try {
            if (fs.existsSync(fileToWrite)) {
                return { success: false, message: 'Name already taken' }
            } else if (invalidChars.test(fileName)) {
                return { success: false, message: 'File name contains invalid characters' };
            }
            fs.writeFileSync(fileToWrite, "")
            return { success: true, message: 'File created' };
        } catch (err) {
            console.error(err)
            return { success: false, message: 'Error creating file' };
        }
    })

    // delete file handler
    ipcMain.handle('delete-file', async (event, filePath) => {
        try {
            if (!fs.existsSync(filePath)) {
            return { success: false, message: 'File does not exist' };
            }

            await shell.trashItem(filePath)
            return { success: true, message: 'File moved to trash' };
        } catch (err) {
            console.error(err);
            return { success: false, message: "Error deleting file" };
        }
    });

    // rename file handler
    ipcMain.handle('rename-file', async (event, dirPath, filePath, fileName) => {
        const newFilePath = path.join(dirPath, fileName);
        const isWindows = process.platform === 'win32';
        const invalidChars = isWindows ? /[\\/:*?"<>|]/ : /\//;

        try {
            if (fs.existsSync(newFilePath)) {
                return { success: false, message: 'Name already taken' };
            } else if (!fs.existsSync(filePath)) {
                return { success: false, message: 'File does not exist' };
            } else if (invalidChars.test(fileName)) {
                return { success: false, message: 'File name contains invalid characters' };
            }
            await fs.rename(filePath, newFilePath);
            return { success: true, message: 'File renamed' };
        } catch (err) {
            console.error(err);
            return { success: false, message: 'Error renaming file', error: err.message };
        }
    });

    // handler for when user drops a file or folder into a folder node
    ipcMain.handle('drop-item', async (event, itemPath, nodePath, type) => {
        if (!fs.existsSync(itemPath)) {
            return { success: false, message: `${type === 'file' ? 'File' : 'Folder'} does not exist` };
        }

        const itemName = path.basename(itemPath);
        const destPath = path.join(nodePath, itemName);

        try {
            if (path.join(itemPath, itemName) === destPath && type === 'folder') {
                return { success: false, message: 'Cannot move folder to subdirectory of itself' }
            }
            await fs.move(itemPath, destPath);
            return { success: true, message: `${type === 'file' ? 'File' : 'Folder'} moved` };
        } catch (err) {
            console.error(err);
            return { success: false, message: `Could not move ${type}` };
        }
    });

    // create folder handler
    ipcMain.handle('create-folder', async (event, dirPath, folderName) => {
        const newFolderPath = path.join(dirPath, folderName)
        const isWindows = process.platform === 'win32';
        const invalidChars = isWindows ? /[\\/:*?"<>|]/ : /\//;

        try {
            if (fs.existsSync(newFolderPath)) {
                return { success: false, message: 'Name already taken' }
            } else if (invalidChars.test(folderName)) {
                return { success: false, message: 'Folder name contains invalid characters' };
            }
            await fs.promises.mkdir(newFolderPath)
            return { success: true, message: "Folder created" }
        } catch (err) {
            console.error(err)
            return { success: false, message: "Error creating folder" }
        }
    })

    // delete folder handler
    ipcMain.handle('delete-folder', async (event, folderPath) => {
        try {
            if (!fs.existsSync(folderPath)) {
            return { success: false, message: "Folder does not exist" }
            }
            await shell.trashItem(folderPath)
            return { success: true, message: "Folder moved to trash" }
        } catch (err) {
            console.error(err)
            return { success: false, message: "Error deleting folder" }
        }
    })

    // rename folder

    ipcMain.handle('rename-folder', async (event, dirPath, folderPath, folderName) => {
        const newFolderPath = path.join(dirPath, folderName);
        const isWindows = process.platform === 'win32';
        const invalidChars = isWindows ? /[\\/:*?"<>|]/ : /\//;

        try {
            if (fs.existsSync(newFolderPath)) {
                return { success: false, message: 'Name already taken' };
            } else if (!fs.existsSync(folderPath)) {
                return { success: false, message: 'Folder does not exist' };
            } else if (invalidChars.test(folderName)) {
                return { success: false, message: 'Folder name contains invalid characters' };
            }
            await fs.rename(folderPath, newFolderPath);
            return { success: true, message: 'Folder renamed' };
        } catch (err) {
            console.error(err);
            return { success: false, message: 'Error renaming folder', error: err.message };
        }
    });

    ///////////////// World handlers //////////////////////

    //////////////////// save world ////////////////////////////
    ipcMain.handle('save-world', (event, rootPath, nodes, edges) => {
        // check if path of folder exists before saving
        if (!fs.existsSync(rootPath)) {
            return { success: false, message: 'Folder does not exist' };
        }

        // set up paths
        const userDataPath = app.getPath('userData')
        const worldsDir = path.join(userDataPath, "worlds")
        const indexPath = path.join(worldsDir, "index.json")

        // world information
        const worldId = Math.floor(Math.random()*10000)
        const worldData = { nodes, edges }
        const worldName = path.basename(rootPath)
        const fileName = `${worldId}-${worldName}.json`; // id-name.json for uniqueness (can have same world name but different paths)
        const worldFilePath = path.join(worldsDir, fileName); // this will only be used if creating a new world
        
        // make worlds directory if it doesn't exist
        if (!fs.existsSync(worldsDir)) {
            fs.mkdirSync(worldsDir, { recursive: true })
        }

        let index = [];
        // read index.json if it exists
        if (fs.existsSync(indexPath)) {
            index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
        }

        // Update or add the entry in index.json
        const now = new Date().toISOString();
        const existing = index.find(w => w.rootPath === rootPath);

        try {
            if (existing) {
                existing.lastModified = now;
                // save worldData to existing world json file
                fs.writeFileSync(path.join(worldsDir, existing.file), JSON.stringify(worldData, null, 2), 'utf-8'); // encode everything (exclude null), 2 is for nice spacing, utf-8 encoding
            } else {
                index.push({
                    id: worldId,
                    file: fileName,  // each filename has to be unique using ids (can't be bob.json & bob.json)
                    worldName: worldName,
                    rootPath: rootPath,
                    lastModified: now
                });
                // create new json file for new world
                fs.writeFileSync(worldFilePath, JSON.stringify(worldData, null, 2), 'utf-8' );
            }
            // write the index.json file to disk
            fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
            return { success: true, message: 'World saved' };
        } catch (err) {
            console.error(err)
            return { success: false, message: 'Error saving world' }
        }
    })

    /////////////// load world ///////////////////////////////
    ipcMain.handle('load-world', (event, file) => {
        // set up paths
        const userDataPath = app.getPath('userData')
        const worldPath = path.join(userDataPath, "worlds", file)

        try {
            const fileContents = fs.readFileSync(worldPath)
            const worldData = JSON.parse(fileContents)
            const rootPath = worldData.nodes[0].data.dirPath
            if (!fs.existsSync(rootPath)) {
                return { success: false, message: "World does not exist" }
            }

            return {
                success: true,
                message: "World loaded",
                nodes: worldData.nodes,
                edges: worldData.edges
            }
        } catch (err) {
            console.error(err)
            return { success: false, message: "Error loading world" }
        }
    });

    /////////////////// delete world ////////////////////////

    ipcMain.handle('delete-world', (event, file) => {
        // set up paths
        const userDataPath = app.getPath('userData')
        const indexPath = path.join(userDataPath, 'worlds', 'index.json')
        const worldPath = path.join(userDataPath, "worlds", file)

        try {
            fs.rmSync(worldPath)
            const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
            const updatedIndex = index.filter((world) => world.file !== file)
            fs.writeFileSync(indexPath, JSON.stringify(updatedIndex, null, 2), 'utf-8')
            return { success: true, message: "World deleted" }
        } catch (err) {
            console.error(err)
            return { success: false, message: "Error deleting world" }
        }
    });

    /////////////////////////////////////////////////////////

    /////////////////// scan saved worlds ////////////////////////

    ipcMain.handle('scan-saved-worlds', () => {
        // set up paths
        const userDataPath = app.getPath('userData')
        const indexPath = path.join(userDataPath, 'worlds', 'index.json')

        // return empty array if index.json doesn't exist
        
        // read index.json and return as object
        try {
            if (!fs.existsSync(indexPath)) {
                return { success: true, data: [] }
            }

            const contents = fs.readFileSync(indexPath, 'utf-8')
            const index = JSON.parse(contents)
            const validIndex = index.filter((world) => fs.existsSync(world.rootPath))
            fs.writeFileSync(indexPath, JSON.stringify(validIndex, null, 2), 'utf-8')
            
            return { success: true, data: validIndex } 
        } catch (err) {
            console.error(err)
            return { success: false, message: "Error displaying worlds" }
        }
    })


    /////////////////// Check if folder exists ///////////////////

    ipcMain.handle('check-folder-exists', (event, dirPath) => {
        return fs.existsSync(dirPath)
    })

    /////////////////////////////////////////////////////////////

    function getUniquePath(destDir, itemName) {
        let destPath = path.join(destDir, itemName)
        let ext = path.extname(itemName)
        let base = path.basename(itemName, ext)
        let newName = itemName
        let counter = 1

        while (fs.existsSync(destPath)) {
            newName = ext ? `${base} (${counter})${ext}` : `${base} (${counter})`
            destPath = path.join(destDir, newName)
            counter++
        }
        return path.join(destDir, newName)
    }
    
    /////////////////// Paste item  ///////////////////

    ipcMain.handle('paste-item', (event, clipboardItem, destDir) => {
        console.log("clipboardItem: ", clipboardItem)

        const { itemPath, type } = clipboardItem

        if (type === 'path') {
            return { success: false, message: "Cannot paste path here" }
        }

        console.log("potato")

        const itemName = path.basename(itemPath)
        const destPath = getUniquePath(destDir, itemName)

        console.log("destPath: ", destPath)

        if (type === 'file') {
            try {
                fs.copyFileSync(itemPath, destPath)
                return { success: true, message: "File pasted" }
            } catch (err) {
                console.error(err)
                return { success: false, message: "Error pasting file" }
            }
        } else if (type === 'folder') {
            try {
                if (fs.existsSync(destPath)) {
                    return { success: false, message: "Folder already exists" }
                } else if (path.join(itemPath, itemName) === destPath) {
                    return { success: false, message: "Cannot paste folder as subdirectory of itself" }
                }

                fs.cpSync(itemPath, destPath, { recursive: true });
                return { success: true, message: "Folder pasted" }
            } catch (err) {
                console.error(err)
                return { success: false, message: "Error pasting folder" } 
            }
        }
    })

    /////////////////////////////////////////////////////////////
}