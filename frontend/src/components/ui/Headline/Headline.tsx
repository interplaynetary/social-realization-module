import React, { HTMLAttributes, ReactNode } from "react";
import * as styles from "./Headline.module.css";

interface HeadlineProps extends HTMLAttributes<HTMLElement> {
    level: "h1" | "h2" | "h3" | "h4";
    children: ReactNode;
}

const Headline: React.FC<HeadlineProps> = ({ level, children, ...rest }) => {
    const Heading = level;

    return (
        <Heading className={styles[level]} {...rest}>
            {children}
        </Heading>
    );
};

export default Headline;
