import React, { ButtonHTMLAttributes } from "react";
import * as styles from "./Button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary";
}

const Button: React.FC<ButtonProps> = ({ children, ...rest }) => {
    return <button className={styles.button} {...rest}>{children}</button>;
};

export default Button;
