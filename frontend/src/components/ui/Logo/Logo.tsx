import React, { InputHTMLAttributes } from "react";
import * as styles from "./Logo.module.css";

interface LogoProps extends InputHTMLAttributes<HTMLInputElement> {}

const Logo: React.FC<LogoProps> = (props) => {
    return <span {...props} className={styles.logo}>⚹ social-realization-module</span>;
};

export default Logo;
