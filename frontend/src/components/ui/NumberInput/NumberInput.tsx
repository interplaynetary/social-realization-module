import React, { InputHTMLAttributes } from "react";
import Input from "../Input/Input";

interface NumberInput extends InputHTMLAttributes<HTMLInputElement> {}

const NumberInput: React.FC<NumberInput> = (props) => {
    return <Input type="number" {...props} />;
};

export default NumberInput;
