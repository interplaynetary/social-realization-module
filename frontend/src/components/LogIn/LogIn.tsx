import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Button from "../ui/Button/Button";
import Card from "../ui/Card/Card";
import TextInput from "../ui/TextInput/TextInput";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { apiKeyAtom } from "../../state/atoms/apiKeyAtom";
import { playerDataAtom } from "../../state/atoms/playerDataAtom"; // Adjusted import

import * as styles from "./LogIn.module.css";

const Login = () => {
    const apiKey = useRecoilValue(apiKeyAtom);

    const setApiKey = useSetRecoilState(apiKeyAtom);
    const setPlayerId = useSetRecoilState(playerDataAtom); // Ensure this is an atom

    const [playerName, setPlayerName] = useState("");
    const [apiKeyInput, setApiKeyInput] = useState(apiKey || "");

    const navigate = useNavigate(); // Initialize useNavigate

    const handleLogin = async () => {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apiKey: apiKeyInput }),
        });

        const data = await response.json();

        if (data.success) {
            setApiKey(apiKeyInput); // Set API key in Recoil state
            setPlayerId(data.playerId); // Set player ID in Recoil state

            // Navigate to the dashboard page
            navigate("/dashboard"); // Adjust the path to your dashboard route
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
            setApiKey(data.apiKey); // Set API key in Recoil state
            setPlayerId(data.playerId); // Set player ID in Recoil state

            // Navigate to the dashboard page
            navigate("/dashboard"); // Adjust the path to your dashboard route
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

                <div
                    style={{
                        textAlign: "center",
                        marginTop: "24px",
                        marginBottom: "24px",
                        fontSize: 14,
                    }}
                >
                    or create an account
                </div>

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
