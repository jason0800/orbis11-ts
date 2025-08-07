import { useEffect, useState, useRef, useCallback } from 'react';
import { Folder, Save, ChevronDown, ChevronRight } from 'lucide-react';

export default function Sidebar({
  handleSelectFolder,
  handleSaveWorld,
  handleLoadWorld,
  handleSidebarWidth,
  handleWorldContextMenu,
  handleCloseContextMenu,
  scanSavedWorlds,
  nodes,
  edges,
  sidebarWidth,
  viewportRef,
}) {
  const [worldsIndex, setWorldsIndex] = useState([]);
  const [collapsed, setCollapsed] = useState(false);

  const isDragging = useRef(false);

  //debugging
  // console.log("in sidebar: ", viewportRef)

  useEffect(() => {
    scanSavedWorlds().then((res) => {
      setWorldsIndex(res);
    });
  }, [scanSavedWorlds]);

  // Mouse event handlers for drag resizing
  function onMouseDown(e) {
    isDragging.current = true;
    e.preventDefault();
  }

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const newWidth = e.clientX;
    handleSidebarWidth(newWidth);
  }, [handleSidebarWidth])

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
  }, [])

  useEffect(() => {
    console.log("in useEffect in sidebar")

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  return (
    <div className="sidebar" style={{ width: sidebarWidth }} onClick={handleCloseContextMenu}>
      <button onClick={handleSelectFolder} className="sidebar-button">
        <Folder size={18} />
        Select folder
      </button>
      <button onClick={() => handleSaveWorld(nodes, edges)} className="sidebar-button save-button">
        <Save size={18} />
        Save world
      </button>

      <div className="saved-worlds">
        <button onClick={() => setCollapsed(!collapsed)} className="saved-worlds-toggle">
          <span className="toggle-icon">
            {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
            Worlds
          </span>
        </button>

        {!collapsed && (
          <div className="saved-worlds-list">
            {worldsIndex.length === 0 && (
              <div className="saved-worlds-empty">No saved worlds</div>
            )}
            {worldsIndex.map((world) => (
              <div
                key={world.id}
                onClick={() => handleLoadWorld(world.file)}
                onContextMenu={(e) => handleWorldContextMenu(e, world.file, viewportRef)}
                className="saved-world-item"
              >
                {world.worldName}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drag handle */}
      <div
        className="drag-handle"
        onMouseDown={onMouseDown}
        title="Drag to resize sidebar"
        onDoubleClick={() => handleSidebarWidth(210)} // Reset width on double-click
      />
    </div>
  );
}
