import { useState, useEffect } from "react";
import { EyeClosed, Route, FileEditIcon, FolderEditIcon, ChevronRight, ClipboardPaste } from 'lucide-react';

export default function HeaderContextMenu(props) {
  const [showFileInput, setShowFileInput] = useState(false);
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [fileName, setFileName] = useState("");
  const [folderName, setFolderName] = useState("");

  const {
    id,
    dirPath,
    position,
    flipped,
    handleHideNode,
    handleCopyPath,
    handleCreateFile,
    handleCreateFolder,
    handlePasteItem,
  } = props;

  useEffect(() => {
    setShowFileInput(false);
    setShowFolderInput(false)
    setFileName("");
    setFolderName("")
  }, [position]);

  return (
    <div
      className="context-menu"
      style={{ top: position.y, left: position.x }}
    >
      <div onClick={() => handleCopyPath(dirPath)} >
        <Route size={16} style={{marginRight: "8px"}}/>
        Copy Path
      </div>
      <div onClick={() => handlePasteItem(dirPath)} >
        <ClipboardPaste size={16} style={{marginRight: "8px"}}/>
        Paste
      </div>
      <div onClick={() => handleHideNode(id)} >
        <EyeClosed size={16} style={{marginRight: "8px"}}/>
        Hide Node
      </div>
      <div
        className="crud-file-option"
        style={{padding: 0}}
        onClick={()=> {
          setShowFileInput(true)
          setShowFolderInput(false)
        }}
      >
        <div>
          <FileEditIcon size={16} style={{marginRight: "8px"}}/>
          Create File
        </div>
        <ChevronRight size={16} style={{marginRight: "8px"}}/>
        {
          showFileInput && 
          <input
            className={`crud-file-input ${flipped ? 'left' : 'right'}`}
            type="text"
            value={fileName}
            autoFocus
            onChange={(e) => setFileName(e.target.value)}
            placeholder="enter file name"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateFile(dirPath, fileName)
              }
            }}
          />
        }
      </div>
      <div
        className="crud-file-option"
        style={{padding: 0}}
        onClick={()=> {
          setShowFolderInput(true)
          setShowFileInput(false)
        }}
      >
        <div>
          <FolderEditIcon size={16} style={{marginRight: "8px"}} />
          Create Folder
        </div>
        <ChevronRight size={16} style={{marginRight: "8px"}}/>
        {
          showFolderInput && 
          <input
            className={`crud-file-input ${flipped ? 'left' : 'right'}`}
            type="text"
            value={folderName}
            autoFocus
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="enter folder name"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateFolder(dirPath, folderName)
              }
            }}
          />
        }
      </div>
    </div>
  );
}
