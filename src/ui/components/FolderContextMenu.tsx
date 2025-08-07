import { useEffect, useState } from "react";
import { Trash2, EditIcon, ChevronRight, Route, Copy } from 'lucide-react';

export default function FolderContextMenu(props) {
    const [showInput, setShowInput] = useState(false)
    const [folderName, setFolderName] = useState("")

    const {
        position,
        flipped,
        dirPath,
        folderPath,
        itemName,
        handleRenameFolder,
        handleConfirmDelete,
        handleCopyPath,
        handleCopyItem,
    } = props;

    console.log("position: ", position)

    useEffect(() => {
        setShowInput(false)
        setFolderName(itemName)
    }, [position, itemName])

    return (
        <div
            className="context-menu"
            style={{ top: position.y, left: position.x }}
        >
            <div onClick={() => handleCopyPath(folderPath)} >
                <Route size={16} style={{marginRight: "8px"}}/>
                Copy Path
            </div>
            <div onClick={() => handleCopyItem(folderPath, 'folder')} >
                <Copy size={16} style={{marginRight: "8px"}}/>
                Copy
            </div>
            <div
                className="crud-file-option"
                onClick={()=>setShowInput(true)} // change to onClick from onMouseEnter
                style={{padding: 0}}
            >
                <div>
                    <EditIcon size={16} style={{marginRight: "8px"}}/>
                    Rename Folder
                </div>
                <ChevronRight size={16} style={{marginRight: "8px"}}/>
                {
                    showInput && 
                    <input
                        className={`crud-file-input ${flipped ? 'left' : 'right'}`}
                        type="text"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        autoFocus
                        placeholder="enter folder name"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleRenameFolder(dirPath, folderPath, folderName)
                            }
                        }}
                    />
                }
            </div>
            <div onClick={() => handleConfirmDelete(folderPath, "folder")} >
                <Trash2 size={16} style={{marginRight: "8px"}}/>
                 Delete Folder
            </div>
        </div>
    );
}