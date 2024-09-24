import React, { InputHTMLAttributes } from "react";
import Input from "../Input/Input";

interface TextInput extends InputHTMLAttributes<HTMLInputElement> {}

const TextInput: React.FC<TextInput> = (props) => {
    return <Input type="text" {...props} />;
};

export default TextInput;
