import React, { InputHTMLAttributes } from "react";
import * as styles from "./Logo.module.css";

interface LogoProps extends InputHTMLAttributes<HTMLInputElement> {}

const Logo: React.FC<LogoProps> = (props) => {
    return <h1 {...props} className={styles.logo}>⚹ social-realizer</h1>;
};

export default Logo;
