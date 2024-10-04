import React, { useEffect } from "react";
import * as styles from "./Overlay.module.css";

type OverlayProps = {
    children: React.ReactNode;
    onClose: () => void;
};

const Overlay: React.FC<OverlayProps> = ({ children, onClose }) => {
    useEffect(() => {
        document.body.classList.add("body-fixed");

        return () => {
            document.body.classList.remove("body-fixed");
        };
    }, []);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

export default Overlay;
