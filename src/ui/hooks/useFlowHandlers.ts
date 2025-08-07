import { useState, useCallback } from 'react';
import { useReactFlow, applyNodeChanges } from '@xyflow/react';
import { toast } from 'react-hot-toast';

// TYPES 
interface Position {
  x: number,
  y: number,
}

// state types
interface WorldContextMenu {
  position: Position,
  file: string,
}

interface ConfirmDialog {
  title: string,
  message: string,
  onConfirm: () => void,
}

interface ClipboardItem {
  itemPath: string,
  type: 'file' | 'folder'
}
///

// custom hook
export default function useFlowHandlers() {  // module
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [headerContextMenu, setHeaderContextMenu] = useState(null)
  const [fileContextMenu, setFileContextMenu] = useState(null)
  const [folderContextMenu, setFolderContextMenu] = useState(null)
  const [worldContextMenu, setWorldContextMenu] = useState<WorldContextMenu | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog | null>(null)
  const [clipboardItem, setClipboardItem] = useState<ClipboardItem | null>(null);
    const [sidebarWidth, setSidebarWidth] = useState(210);
  const { screenToFlowPosition } = useReactFlow();

  // handler for when user selects folder from sidebar
  const handleSelectFolder = async () => {
    const res = await window.electronAPI.selectFolder();

    if (!res.success) {
      toast.error(res.message);
      if (res.error) console.error(res.error);
      return;
    }
    const { dirPath, folderId, folderName, files, subfolders } = res.data;
    const rootNode = [{
      id: folderId,
      position: { x: 100, y: 100 },
      data: {
        dirPath,
        label: folderName,
        files,
        subfolders,
        parentId: null,
      },
      type: "folderNode",
      style: {
        width: 340,
        height: 290,
      },
    }];
    setNodes(rootNode);
  };

  // handler for when user drags and drops a folder node
  const handleNodeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    if (data.type === 'file') {
      toast.error("Cannot drop file as a node")
      return
    }

    const position = screenToFlowPosition({
      x: e.clientX,
      y: e.clientY,
    });

    window.electronAPI.scanFolder(data.itemPath)
      .then((response) => {
        const { dirPath, folderId, folderName, files, subfolders } = response;

        const newNode = {
          id: folderId,
          data: {
            dirPath: dirPath,
            label: folderName,
            files: files,
            subfolders: subfolders,
            parentId: data.parentId,
          },
          position,
          type: "folderNode",
          style: {
            width: 340,
            height: 290,
          },
        };

        const nodeAlreadyExists = nodes.some((n) => (
          dirPath === n.data.dirPath
        ))

        if (!nodeAlreadyExists) {
          const newNodes = nodes.concat(newNode);
          const newEdges = newNodes.map((node) => ({
            id: `${node.data.parentId}->${node.id}`,
            source: node.data.parentId,
            target: node.id
          }));
          setNodes(newNodes);
          setEdges(newEdges);
        } else {
          toast.error("Folder node already dropped")
        }
      });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const onNodesChange = (changes) => {
    setNodes(applyNodeChanges(changes, nodes)) // applyNodeChanges returns array of updated nodes
    setHeaderContextMenu(null)
    setFileContextMenu(null)
    setFolderContextMenu(null)
    setWorldContextMenu(null)
  };

  const onPaneClick = () => {
    setHeaderContextMenu(null)
    setFileContextMenu(null)
    setFolderContextMenu(null)
    setWorldContextMenu(null)
  }

  const onMoveStart = () => {
    setHeaderContextMenu(null)
    setFolderContextMenu(null)
    setFileContextMenu(null)
    setWorldContextMenu(null)
  }

  ///////////////////// React Flow Node Header Context Menu Handlers ////////////////////////////

  // handler to open header context menu when r-clicking on folder node header
  const handleHeaderContextMenu = useCallback((e, id, dirPath, wrapperRef) => {
    e.preventDefault();
    setFileContextMenu(null);
    setFolderContextMenu(null);
    setHeaderContextMenu(null);
    setWorldContextMenu(null);

    const wrapperRect = wrapperRef?.current?.getBoundingClientRect();
    const menuWidth = 215; // adjust to your menu's actual width
    const menuHeight = 205;

    let flipped = false
    let x = e.clientX - wrapperRect.left;
    let y = e.clientY - wrapperRect.top;

    if (x + menuWidth > wrapperRect.width) {
      x = wrapperRect.width - menuWidth;
    }

    if (x + menuWidth + 180 > wrapperRect.width) {  // flip input field
      flipped = true
    }

    if (y + menuHeight > wrapperRect.height) {
      y = wrapperRect.height - menuHeight;
    }

    const position = { x, y }

    setHeaderContextMenu({id, dirPath, position, flipped,  });
  }, []);

  const handleHideNode = (id) => {
    const unhiddenNodes = (nodes.filter((node) => node.id !== id))
    setNodes(unhiddenNodes)
    setHeaderContextMenu(null)
  }

  const handleCopyPath = async (dirPath) => {
    const result = await window.electronAPI.copyPath(dirPath)
    if (result.success) {
      toast.success(result.message)
      setClipboardItem({itemPath: dirPath, type: 'path'})
    } else {
      toast.error(result.message)
    }
    setHeaderContextMenu(null)
    setFileContextMenu(null)
    setFolderContextMenu(null)
  }

  const handleCreateFile = async (dirPath, fileName) => {
    const result = await window.electronAPI.createFile(dirPath, fileName)
    if (result.success) {
      handleRefresh()
      toast.success("File created")
    } else {
      toast.error(result.message)
    }
    setHeaderContextMenu(null)
  }

  const handleCreateFolder = async (dirPath, folderName) => {
    const result = await window.electronAPI.createFolder(dirPath, folderName)
    
    if (result.success) {
      handleRefresh()
      toast.success("Folder created")
    } else {
      toast.error(result.message)
    }
    setHeaderContextMenu(null)
  }

  //////////////////////////////////////////////////////////////////////

  //////////// File Context Menu Handlers //////////////////////////////

  // handler to open file context menu when r-clicking on file
  const handleFileContextMenu = useCallback((e, filePath, itemName, dirPath, wrapperRef) => {
    e.preventDefault()
    setHeaderContextMenu(null)
    setFolderContextMenu(null)
    setFileContextMenu(null)
    setWorldContextMenu(null)

    const wrapperRect = wrapperRef?.current?.getBoundingClientRect();
    const menuWidth = 215;
    const menuHeight = 170;

    let flipped = false
    let x = e.clientX - wrapperRect.left;  // remember that FileContextMenu is positioned relative to the div wrapping React Flow
    let y = e.clientY - wrapperRect.top;

    if (x + menuWidth > wrapperRect.width) { // keep menu inside of viewport
      x = wrapperRect.width - menuWidth;
    }

    if (x + menuWidth + 180 > wrapperRect.width) {  // flip input field
      flipped = true
    }

    if (y + menuHeight > wrapperRect.height) { // keep menu inside of viewport
      y = wrapperRect.height - menuHeight;
    }

    const position = { x, y }

    setFileContextMenu({position, flipped, filePath, itemName, dirPath})
  }, [])
  
  const handleRenameFile = async (dirPath, filePath, fileName) => {
    const res = await window.electronAPI.renameFile(dirPath, filePath, fileName);

    if (!res.success) {
      toast.error(res.message);
      if (res.error) console.error(res.error);
    } else {
      toast.success(res.message);
    }

    handleRefresh();
    setFileContextMenu(null);
  };
  
  const handleDeleteFile = async (filePath) => {
    const res = await window.electronAPI.deleteFile(filePath);

    if (!res.success) {
      toast.error(res.message);
      if (res.error) console.error(res.error);
    } else {
      toast(res.message, { icon: '🗑️' });
    }

    handleRefresh();
    setConfirmDialog(null);
  };

  function handleCopyItem(itemPath: string, type: 'file' | 'folder') {
    console.log("in handleCopyItem: ", itemPath, type)
    setClipboardItem({ itemPath, type });
    if (type === 'file') {
      toast.success("File copied")
    } else if (type === 'folder') {
      toast.success("Folder copied")
    }
    setFileContextMenu(null)
    setFolderContextMenu(null)
  }

  const handlePasteItem = async (destDir: string) => {
    const result = await window.electronAPI.pasteItem(clipboardItem, destDir);

    if (result.success) {
      handleRefresh()
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
    handleRefresh()
    setHeaderContextMenu(null)
  }
  /////////////////////////////////////////////////////////////////////////

  ////////////////////////// Folder Context Menu Handlers //////////////////

  // handler to open folder context menu when r-clicking on folder
  const handleFolderContextMenu = useCallback((e, folderPath, itemName, dirPath, wrapperRef) => {
    e.preventDefault()
    setHeaderContextMenu(null)
    setFileContextMenu(null)
    setFolderContextMenu(null)
    setWorldContextMenu(null)

    const wrapperRect = wrapperRef?.current?.getBoundingClientRect();
    const menuWidth = 215;
    const menuHeight = 170;

    let flipped = false
    let x = e.clientX - wrapperRect.left;  // remember that FolderContextMenu is positioned relative to the div wrapping React Flow
    let y = e.clientY - wrapperRect.top;

    if (x + menuWidth > wrapperRect.width) {
      x = wrapperRect.width - menuWidth;
    }

    if (x + menuWidth + 180 > wrapperRect.width) {  // flip input field
      flipped = true
    }

    if (y + menuHeight > wrapperRect.height) {
      y = wrapperRect.height - menuHeight;
    }

    const position: Position = { x, y }

    setFolderContextMenu({position: position, flipped: flipped, folderPath: folderPath, itemName: itemName, dirPath: dirPath})
  }, [])

  // handler to delete folder
  const handleDeleteFolder = async (folderPath) => {
    const result = await window.electronAPI.deleteFolder(folderPath)
    if (result.success) {
      toast(result.message, { icon: '🗑️' })
      handleRefresh()
    } else {
      toast.error(result.message)
      handleRefresh()
    }
    setConfirmDialog(null)
  }

  // rename folder
  const handleRenameFolder = async (dirPath, folderPath, folderName) => {
    console.log("in handleRenameFolder")
    const res = await window.electronAPI.renameFolder(dirPath, folderPath, folderName);

    if (!res.success) {
      toast.error(res.message);
      if (res.error) console.error(res.error);
    } else {
      toast.success(res.message);
    }

    handleRefresh();
    setFolderContextMenu(null);
  };

  //////////////////////////////////////////////////////////////////////////

  //////////////////// World Context Menu //////////////////////////////////

  // handler to open world context menu when r-clicking on saved worlds
  const handleWorldContextMenu = useCallback((e, file: string, sidebarRef) => {
    e.preventDefault()
    setHeaderContextMenu(null)
    setFileContextMenu(null)
    setFolderContextMenu(null)
    setWorldContextMenu(null)

    console.log("sidebarRef in handleWorldContextMenu: ", sidebarRef?.current?.getBoundingClientRect())

    const sidebarRect = sidebarRef?.current?.getBoundingClientRect();
    const menuHeight = 60;
    const menuWidth = 210;

    let x = e.clientX
    let y = e.clientY

    if (y + menuHeight > sidebarRect.height) {
      y = sidebarRect.height - menuHeight;
    }

    if (x + menuWidth > sidebarRect.width) {
      x = sidebarRect.width - menuWidth;
    }

    const position: Position = { x, y }

    setWorldContextMenu({position: position, file: file})
  }, [])


  ///////////////////////////////////////////////////////////////////////////

  ///////////////////// Confirm Dialog Handlers ////////////////////////////

  const handleConfirmDelete = (resource, type: "file" | "folder") => {
    // Close any open context menu
    if (type === "file") {
      setFileContextMenu(null);

      setConfirmDialog({
        title: "Delete file?",
        message: "This file will be moved to trash",
        onConfirm: () => {
          handleDeleteFile(resource);
          setConfirmDialog(null);
        }
      });
    } else if (type === "folder") {
      setFolderContextMenu(null);

      setConfirmDialog({
        title: "Delete folder?",
        message: "This folder will be moved to trash",
        onConfirm: () => {
          handleDeleteFolder(resource);
          setConfirmDialog(null);
        }
      });

    } else if (type === "world") {
      setWorldContextMenu(null);

      setConfirmDialog({
        title: "Delete world?",
        message: "This action cannot be undone.",
        onConfirm: () => {
          handleDeleteWorld(resource);
          setConfirmDialog(null);
        }
      });
    }
  };

  const onCancel = () => {
    setConfirmDialog(null)
  }

  //////////////////////////////////////////////////////////////////////////

  ///////////////////////////// Save, Load, and Delete Worlds //////////////////////////////

  const handleSaveWorld = (nodesToSave, edgesToSave) => {
    if (nodesToSave.length !== 0) {
      const rootPath = nodesToSave[0].data.dirPath
  
      window.electronAPI.saveWorld(rootPath, nodesToSave, edgesToSave).then((res) => {
        if (res.success) {
          toast(res.message, {
            icon: '🌎',
          });
        } else {
          toast.error(res.message)
        }
        handleRefresh()
      })
    } else if (nodesToSave.length === 0) {
      toast.error("Cannot save world with zero nodes")
    }
  }

  const handleLoadWorld = async (file: string) => {
    const result = await window.electronAPI.loadWorld(file)
    if (result.success) {
      toast(result.message, {
        icon: '🌎',
      });

      const checkNodes = await Promise.all(
        result.nodes.map(async (node) => {
          const exists = await window.electronAPI.checkFolderExists(node.data.dirPath)
          return { node, exists }
        })
      )

      const validNodes = (checkNodes
        .filter(check => {
          return check.exists
        })
        .map(check => check.node)
      )

      console.log("result.nodes: ", result.nodes)
      console.log("validNodes: ", validNodes)
      const validNodeIds = validNodes.map(node => node.id)
      console.log("validNodeIds: ", validNodeIds)

      console.log("result.edges: ", result.edges)

      const validEdges = result.edges.filter((edge) => ( // filters edges with source and target nodes that are valid
        validNodeIds.includes(edge.source) && validNodeIds.includes(edge.target)
      ))

      console.log("validEdges: ", validEdges)

      const refreshedNodes = await Promise.all(
        validNodes.map(async (node) => {
          const response = await window.electronAPI.scanFolder(node.data.dirPath)
          const { files, subfolders } = response
          const refreshedNodes = {
            ...node,
            data: {
              ...node.data,
              files,
              subfolders,
            }
          };
        return refreshedNodes
      }))

      setNodes(refreshedNodes)
      setEdges(validEdges)
      // handleSaveWorld(refreshedNodes, validEdges)
    } else {
      toast.error(result.message)
      setNodes([])
      setEdges([])
    }
  }

  const handleDeleteWorld = async (file: string) => {
    const result = await window.electronAPI.deleteWorld(file)
    if (result.success) {
      toast(result.message, {
        icon: '🌎',
      });
      setNodes([])
      setEdges([])
    } else {
      toast.error(result.message)
    }
  }
  //////////////////////////////////////////////////////////////////////////

  /////////////////////////////Refresh Nodes //////////////////////////////

  const handleRefresh = useCallback(async () => { // handleRefresh closes over nodes state variable
    const checkNodes = await Promise.all(
      nodes.map(async (node) => {
        const exists = await window.electronAPI.checkFolderExists(node.data.dirPath)
        return { node, exists }
      })
    )

    const validNodes = (checkNodes
      .filter(check => {
        return check.exists
      })
      .map(check => check.node)
    )

    const refreshedNodes = await Promise.all(
      validNodes.map(async (node) => {
        const response = await window.electronAPI.scanFolder(node.data.dirPath)
        const { files, subfolders } = response
        const refreshedNode = {
          ...node,
          data: {
            ...node.data,
            files,
            subfolders,
          }
        };
      return refreshedNode
    }))
    setNodes(refreshedNodes)
  }, [nodes])  // re-create handleRefresh if nodes change to avoid stale closures

  ///////////////////////////////////////////////////////////////////////////

  ////////////////////////// Scan Saved Worlds /////////////////////////////
  const scanSavedWorlds = async () => {
    const result = await window.electronAPI.scanSavedWorlds()

    if (result.success) {
      return result.data
    } else {
      toast.error(result.message)
    }
  }

  /////////////////////////////////////////////////////////////////////////

  ///////////////////////// Sidebar width handler ////////////////////////

  const handleSidebarWidth = useCallback((newWidth: number) => {
    setFileContextMenu(null)
    setFolderContextMenu(null)
    setHeaderContextMenu(null)
    setWorldContextMenu(null)
    setSidebarWidth(newWidth)
  }, [])

  ///////////////////////////////////////////////////////////////////////

  ///////////////////////// Sidebar width handler ///////////////////////

  const handleCloseContextMenu = useCallback(() => {
    console.log("in handleCloseContextMenu")
    setFileContextMenu(null)
    setFolderContextMenu(null)
    setHeaderContextMenu(null)
    setWorldContextMenu(null)
  }, [])

  ///////////////////////////////////////////////////////////////////////

    return {
    // nodes and edges state variables
    nodes,
    edges,
    // Context menu state variables
    headerContextMenu,
    fileContextMenu,
    folderContextMenu,
    worldContextMenu,
    // Confirm dialog state and handlers
    confirmDialog,
    handleConfirmDelete,
    onCancel,
    // Node interaction handlers
    handleNodeDrop,
    handleDragOver,
    onNodesChange,
    handleSelectFolder,
    onPaneClick,
    onMoveStart,
    handleHideNode,
    // Context menu handlers
    handleHeaderContextMenu,
    handleFileContextMenu,
    handleFolderContextMenu,
    handleWorldContextMenu,
    // File and folder operations
    handleCopyPath,
    handleCreateFile,
    handleCreateFolder,
    handleDeleteFile,
    handleDeleteFolder,
    handleRenameFile,
    handleRenameFolder,
    // copy & paste files
    handleCopyItem,
    handlePasteItem,
    // World save/load/refresh
    handleSaveWorld,
    handleLoadWorld,
    handleRefresh,
    // Load all saved worlds
    scanSavedWorlds,
    // sidebar width state & handler
    sidebarWidth,
    handleSidebarWidth,
    // handle close context menu
    handleCloseContextMenu,
  };
}
