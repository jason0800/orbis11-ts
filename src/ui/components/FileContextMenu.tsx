import { useState, useEffect } from "react";
import { Route, Trash2, EditIcon, ChevronRight, Copy } from 'lucide-react';
import type { FileContextMenuProps } from "../types";

export default function FileContextMenu(props: FileContextMenuProps) {
    const [showInput, setShowInput] = useState(false)
    const [fileName, setFileName] = useState("")

    const {
        position,
        flipped,
        filePath,
        itemName,
        dirPath,
        handleRenameFile,
        handleConfirmDelete,
        handleCopyPath,
        handleCopyItem,
    } = props;

    
    useEffect(() => {
        setShowInput(false)
        setFileName(itemName)
    }, [position, itemName])

    return (
        <div
            className="context-menu"
            style={{ top: position.y, left: position.x }}
        >
            <div onClick={() => handleCopyPath(filePath)} >
                <Route size={16} style={{marginRight: "8px"}}/>
                Copy Path
            </div>
            <div onClick={() => handleCopyItem(filePath, 'file')} >
                <Copy size={16} style={{marginRight: "8px"}}/>
                Copy
            </div>
            <div
                className="crud-file-option"
                onClick={()=>setShowInput(true)}
                style={{padding: 0}}
            >
                <div>
                    <EditIcon size={16} style={{marginRight: "8px"}}/>
                    Rename File
                </div>
                <ChevronRight size={16} style={{marginRight: "8px"}}/>
                {
                    showInput && 
                    <input
                        className={`crud-file-input ${flipped ? 'left' : 'right'}`}
                        type="text"
                        value={fileName}
                        autoFocus
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="enter file name"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleRenameFile(dirPath, filePath, fileName)
                            }
                        }}
                    />
                }
            </div>
            <div onClick={() => handleConfirmDelete(filePath, "file")} onMouseEnter={() => setShowInput(false)} >
                <Trash2 size={16} style={{marginRight: "8px"}}/>
                Delete File
            </div>
        </div>
    );
}
