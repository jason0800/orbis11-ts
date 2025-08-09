///////////////// Types for useFlowHandlers.ts ///////////////
export interface Position {
  x: number;
  y: number;
}

///////////// context menu types ////////////////
interface BaseContextMenu {
  position: Position;
  flipped: boolean;
}

export interface HeaderContextMenu extends BaseContextMenu {
  dirPath: string;
  id: string;
}

export interface FileContextMenu extends BaseContextMenu {
  dirPath: string;
  itemPath: string;
  itemName: string;
}

export interface FileContextMenuProps {
  position: string;
  flipped: boolean;
  filePath: string;
  itemName: string;
  dirPath: string;
  handleRenameFile: (dirPath: string, filePath: string, fileName: string) => void;
  handleConfirmDelete: () => void;
  handleCopyPath: (filePath: string) => void;
  handleCopyItem: (filePath: string, type: string) => void;
}

export interface FolderContextMenu extends BaseContextMenu {
  dirPath: string;
  itemPath: string;
  itemName: string;
}

export interface WorldContextMenu {
  position: Position;
  file: string;
}

/////////// confirm dialog ////////////
export interface ConfirmDialog {
  title: string,
  message: string,
  onConfirm: () => void,
}

export interface ConfirmDialogProps extends ConfirmDialog {
  onCancel: () => void;
}

/////////// clipboard item ////////////
export interface ClipboardItem {
  itemPath: string,
  type: 'file' | 'folder' | 'path'
}