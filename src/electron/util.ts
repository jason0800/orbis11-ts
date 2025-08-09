import path from "node:path"
import fs from "node:fs"
import { v4 as uuidv4 } from 'uuid';

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 b';

    const k = 1000;
    const sizes = ['b', 'kb', 'mb', 'gb', 'tb'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));

    return `${size} ${sizes[i]}`;
}

export function isDev(): boolean {
    return globalThis.process.env.NODE_ENV === 'development';
}

export function scanFolder(dirPath: string): ScannedFolder {
    const folderName = path.basename(dirPath)
    const folderId = uuidv4().substring(20)
    const rawItems = fs.readdirSync(dirPath)
    const files: File[] = []
    const subfolders: Subfolder[] = []

    rawItems.forEach((rawItem) => {
        const itemPath = path.join(dirPath, rawItem)
        const itemId = uuidv4().substring(20)
        const stats = fs.statSync(itemPath)

        if (stats.isDirectory()) {
            subfolders.push({
                id: itemId,
                name: path.basename(itemPath),
                path: itemPath,
                type: 'folder'
        })} else if (stats.isFile()) {
            files.push({
                id: itemId,
                name: path.basename(itemPath),
                path: itemPath,
                type: 'file',
                size: formatBytes(stats.size)
            })
        }
    })
    return { dirPath, folderId, folderName, files, subfolders }
}