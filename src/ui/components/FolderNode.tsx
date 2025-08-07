import { Handle, NodeResizer } from "@xyflow/react";
import toast from "react-hot-toast";

/////////////////////// Handlers //////////////////////
const handleFileClick = (filePath) => {
  window.electronAPI.openFile(filePath)
  .then(result => {
    if (result) {
      alert(`Failed to open file: ${result}`);
    }
  });
}

// drag subfolder
const handleDragStartSubfolder = (e, subfolderPath, parentId, type) => {
  e.dataTransfer.setData('text/plain', JSON.stringify({
    itemPath: subfolderPath,
    parentId,
    type,
  }))
};

// drag file (can only go into another folder - can't be dropped as node)
const handleDragStartFile = (e, filePath, dirPath, type) => {  // event, filePath
  console.log("in handleDragStartFile: ", type)
  e.dataTransfer.setData('text/plain', JSON.stringify({
    itemPath: filePath,
    dirPath,
    type,
  }))
}

////////////////////////////////////////////////////////

//////////////// Folder Node Component ///////////////////
function FolderNode(props) {
  // console.log("props in FolderNode: ", props)
  const {
    id,
    selected,
    handleHeaderContextMenu,
    handleFileContextMenu,
    handleFolderContextMenu,
    handleCloseContextMenu,
    handleRefresh,
    wrapperRef,
  } = props
  const {dirPath, label, files, subfolders, parentId} = props.data

  // handle what happens when user drops a file / folder in this node (haven't done folder yet)
  const handleDropInNode = async (e, nodePath) => {
    e.preventDefault();
    e.stopPropagation();

    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    const { itemPath, type } = data;

    const res = await window.electronAPI.dropItem(itemPath, nodePath, type);
    if (!res.success) {
      toast.error(res.message);
    } else {
      toast.success(res.message);
    }
    handleRefresh();
  };

  if (files.length === 0 && subfolders.length === 0) {
    return (
      <>
        <NodeResizer
          color="#d3d3d3ff"
          isVisible={selected}
        />
        <div
          className="folder-node"
          onDrop={(e)=> handleDropInNode(e, dirPath)}
          onClick={handleCloseContextMenu}
        >
        <div
        className="folder-node-header"
        onContextMenu={(e)=>handleHeaderContextMenu(e, id, dirPath, wrapperRef)}>
          <span>{label}</span>
        </div>
        <div className="no-content" >
          add some stuff!
        </div>
        { parentId && <Handle type="target" position="top" style={{ background: '#555' }} /> }
        <Handle type="source" position="bottom" style={{ background: '#555', display: 'block' }} />
      </div>
      </>
    )
  } else {
    return (
      <>
        <NodeResizer color="#d3d3d3ff" isVisible={selected} />
          <div 
            className="folder-node nowheel"
            onDrop={(e)=> handleDropInNode(e, dirPath)}
            onClick={handleCloseContextMenu}
          >
            <div className="folder-node-header" onContextMenu={(e)=>handleHeaderContextMenu(e, id, dirPath, wrapperRef)}>
              <span>{label}</span>
            </div>
            <div className="folder-node-items">
              {files.map((item) => (
                <div
                  className="folder-node-item nodrag"
                  key={item.id}
                  title={item.name}
                  onClick={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    handleFileClick(item.path)
                  }}
                  onContextMenu={(e) => handleFileContextMenu(e, item.path, item.name, dirPath, wrapperRef)}
                  onDragStart={(e) => handleDragStartFile(e, item.path, dirPath, item.type)}
                  draggable="true"
                >
                  <span className="item-name">
                    {item.name}
                  </span>
                  <span style={{color:"grey"}}>
                    {item.size}
                  </span>
                </div>
              ))}
              {subfolders.map((item) => (
                <div
                  className="folder-node-item nodrag"
                  key={item.id}
                  title={item.name}
                  onClick={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    handleFileClick(item.path)
                  }}
                  onDragStart={(e) => handleDragStartSubfolder(e, item.path, id, item.type)}
                  onContextMenu={(e) => handleFolderContextMenu(e, item.path, item.name, dirPath, wrapperRef)}
                  draggable="true"
                >
                  <span className="item-name">
                    <strong>{item.name}</strong>
                  </span>
                </div>
              ))}
            </div>
            <div className="folder-node-footer">
              { [...files, ...subfolders].length }
              { [...files, ...subfolders].length === 1 ? ' item' : ' items' }
            </div>
            { parentId && <Handle type="target" position="top" style={{ background: '#555' }} /> }
            <Handle type="source" position="bottom" style={{ background: '#555', display: 'block' }} />
          </div>
      </>
    );
  }
}

/////////////////////////////////////////////////////////////////////////

export default (FolderNode)