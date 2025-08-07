// import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function WorldContextMenu(props) {
    const {
        position,
        file,
        handleConfirmDelete,
    } = props;

    return (
        <div
            className="context-menu"
            style={{ top: position.y, left: position.x }}
        >
            <div onClick={() => handleConfirmDelete(file, 'world')}>
                <Trash2 size={16} style={{marginRight: "8px"}}/>
                 Delete world
            </div>
        </div>
    );

}