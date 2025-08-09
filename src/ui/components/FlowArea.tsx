import { useCallback, useMemo, useRef } from 'react'
import { ReactFlow, Background, Controls, MiniMap, ControlButton } from '@xyflow/react';
import { Toaster, toast } from 'react-hot-toast';
import useFlowHandlers from '../hooks/useFlowHandlers';
import FolderNode from './FolderNode';
import SideBar from './SideBar';
import HeaderContextMenu from './HeaderContextMenu';
import FileContextMenu from './FileContextMenu';
import FolderContextMenu from './FolderContextMenu';
import ConfirmDialog from './ConfirmDialog';
import WorldContextMenu from './WorldContextMenu';

export default function FlowArea() {
  const {
    // Nodes and edges
    nodes,
    edges,
    // Context menu state variables
    headerContextMenu,
    fileContextMenu,
    folderContextMenu,
    worldContextMenu,
    // Confirm dialog
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
    // Context menu open handlers
    handleHeaderContextMenu,
    handleFileContextMenu,
    handleFolderContextMenu,
    handleWorldContextMenu,
    // File and folder operations
    handleCopyPath,
    handleCreateFile,
    handleCreateFolder,
    handleRenameFile,
    handleRenameFolder,
    // copy & paste files
    handleCopyItem,
    handlePasteItem,
    // World save/load/refresh
    handleSaveWorld,
    handleLoadWorld,
    handleRefresh,
    // Scanning saved worlds
    scanSavedWorlds,
    // sidebar state & handler
    sidebarWidth,
    handleSidebarWidth,
    // handle close context menu
    handleCloseContextMenu,
  } = useFlowHandlers();  // lexical scope of useFlowHandlers disappears after function call (event handlers still have access to useFlowHandlers lexical scope through closure)
  
  const wrapperRef = useRef(null);
  const viewportRef = useRef(null);

  const FolderNodeWrapper = useCallback((nodeProps) => (
      <FolderNode
        {...nodeProps}
        handleHeaderContextMenu={handleHeaderContextMenu}
        handleFileContextMenu={handleFileContextMenu}
        handleFolderContextMenu={handleFolderContextMenu}
        handleRefresh={handleRefresh}
        handleCloseContextMenu={handleCloseContextMenu}
        wrapperRef={wrapperRef}
      />
    ), [handleHeaderContextMenu, handleFileContextMenu, handleFolderContextMenu, handleCloseContextMenu, handleRefresh])

  const nodeTypes = useMemo(() => ({  // this memoizes the nodeTypes object
    folderNode: FolderNodeWrapper,
  }), [FolderNodeWrapper]); // only re-create nodeTypes if FolderNodeWrapper changes

  return (
    <>
      <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }} ref={viewportRef}>
        <SideBar
          handleSelectFolder={handleSelectFolder}
          handleSaveWorld={handleSaveWorld}
          handleLoadWorld={handleLoadWorld}
          scanSavedWorlds={scanSavedWorlds}
          handleSidebarWidth={handleSidebarWidth}
          handleWorldContextMenu={handleWorldContextMenu}
          handleCloseContextMenu={handleCloseContextMenu}
          nodes={nodes}
          edges={edges}
          sidebarWidth={sidebarWidth}
          viewportRef={viewportRef}
        />
        {
          worldContextMenu &&
          <WorldContextMenu
            {...worldContextMenu}
            handleWorldContextMenu={handleWorldContextMenu}
            handleConfirmDelete={handleConfirmDelete}
          />
        }
        {
          confirmDialog && 
          <ConfirmDialog
            title={confirmDialog.title}
            message={confirmDialog.message}
            onConfirm={confirmDialog.onConfirm}
            onCancel={onCancel}
          />
        }
        <div
          style={{ flexGrow: 1, height: '100vh', position: 'relative' }}
          ref={wrapperRef}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            minZoom={0.1}
            maxZoom={2}
            style={{ width: '100%', height: '100%' }}
            onPaneClick={onPaneClick}
            onMoveStart={onMoveStart}
            onDragOver={handleDragOver}
            onDrop={handleNodeDrop}
          >
            <Background />
            <Controls>
              <ControlButton
                title="Refresh"
                onClick={() => {
                  handleRefresh()
                  toast.success("Refreshed")
                }}>
                ꩜
              </ControlButton>
            </Controls>
            <MiniMap />
            {
              headerContextMenu &&
              <HeaderContextMenu
                {...headerContextMenu}
                sidebarWidth={sidebarWidth}
                handleHideNode={handleHideNode}
                handleCopyPath={handleCopyPath}
                handleCreateFile={handleCreateFile}
                handleCreateFolder={handleCreateFolder}
                handlePasteItem={handlePasteItem}
              />
            }
            {
              fileContextMenu &&
              <FileContextMenu
                {...fileContextMenu}
                sidebarWidth={sidebarWidth}
                handleConfirmDelete={handleConfirmDelete}
                handleRenameFile={handleRenameFile}
                handleCopyPath={handleCopyPath}
                handleCopyItem={handleCopyItem}
              />
            }
            {
              folderContextMenu &&
              <FolderContextMenu
                {...folderContextMenu}
                sidebarWidth={sidebarWidth}
                handleConfirmDelete={handleConfirmDelete}
                handleRenameFolder={handleRenameFolder}
                handleCopyPath={handleCopyPath}
                handleCopyItem={handleCopyItem}
              />
            }
          </ReactFlow>
        </div>
      </div>
      <Toaster />
    </>
  );
}