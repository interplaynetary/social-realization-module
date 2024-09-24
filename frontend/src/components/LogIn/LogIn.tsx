import { useState } from "react";
import Button from "../ui/Button/Button";
import Card from "../ui/Card/Card";
import TextInput from "../ui/TextInput/TextInput";
import * as styles from "./LogIn.module.css";

const Login = ({ setApiKey, setPlayerId }) => {
    const [playerName, setPlayerName] = useState("");
    const [apiKeyInput, setApiKeyInput] = useState("");

    const handleLogin = async () => {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apiKey: apiKeyInput }),
        });

        const data = await response.json();

        if (data.success) {
            setApiKey(apiKeyInput);
            setPlayerId(data.playerId);
        } else {
            alert("Login failed: " + data.error);
        }
    };

    const handleRegister = async () => {
        const response = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playerName }),
        });

        const data = await response.json();

        if (data.success) {
            setApiKey(data.apiKey);
            setPlayerId(data.playerId);
        } else {
            alert("Registration failed: " + data.error);
        }
    };

    return (
        <div className={styles.login}>
            <Card>
                <TextInput
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Enter API Key"
                />

                <Button variant="primary" onClick={handleLogin}>
                    Log In
                </Button>

                <hr />
                <span>or create an account</span>

                <TextInput
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter Name"
                />

                <Button variant="secondary" onClick={handleRegister}>
                    Register
                </Button>
            </Card>
        </div>
    );
};

export default Login;
