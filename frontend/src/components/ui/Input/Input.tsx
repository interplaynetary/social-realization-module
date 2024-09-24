import React, { InputHTMLAttributes } from "react";
import * as styles from "./Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = (props) => {
    return <input {...props} className={styles.input} />;
};

export default Input;
