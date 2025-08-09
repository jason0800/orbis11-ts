import type { ConfirmDialogProps } from "../types"

export default function ConfirmDialog({ title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <h2 className="dialog-title">{title || "Are you sure?"}</h2>
        <p className="dialog-message">{message || "This action cannot be undone."}</p>
        <div className="dialog-buttons">
          <button onClick={onCancel} className="dialog-cancel">Cancel</button>
          <button onClick={onConfirm} className="dialog-delete">Delete</button>
        </div>
      </div>
    </div>
  );
}