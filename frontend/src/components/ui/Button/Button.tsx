import React, { ButtonHTMLAttributes } from "react";
import * as styles from "./Button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary";
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = "secondary",
    ...rest
}) => {
    const variantClass = variant ? styles[variant] : "";

    const classes = [styles.button, variantClass]
        .filter(Boolean) // Removes any falsy values like empty strings
        .join(" "); // Joins classes into a single string

    return (
        <button className={classes} {...rest}>
            {children}
        </button>
    );
};

export default Button;
