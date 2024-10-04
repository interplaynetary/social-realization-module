import React, { HTMLAttributes } from "react";
import Headline from "../Headline/Headline";
import * as styles from "./PageHeadline.module.css";

interface PageHeadlineProps extends HTMLAttributes<HTMLDivElement> {}

const PageHeadline: React.FC<PageHeadlineProps> = ({ children, ...rest }) => {
    return (
        <Headline level="h2" {...rest}>
            {children}
        </Headline>
    );
};

export default PageHeadline;
