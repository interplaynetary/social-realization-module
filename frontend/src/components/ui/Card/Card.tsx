import React, { HTMLAttributes } from "react";
import * as styles from "./Card.module.css";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

const Card: React.FC<CardProps> = ({ children, ...rest }) => {
    return (
        <div className={styles.card} {...rest}>
            {children}
        </div>
    );
};

export default Card;
