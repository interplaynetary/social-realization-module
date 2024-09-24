import React, { HTMLAttributes } from "react";
import * as styles from "./Container.module.css";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {}

const Container: React.FC<ContainerProps> = ({ children, ...rest }) => {
    return (
        <section className={styles.container} {...rest}>
            {children}
        </section>
    );
};

export default Container;
