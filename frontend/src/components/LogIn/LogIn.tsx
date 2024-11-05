import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button/Button";
import Card from "../ui/Card/Card";
import TextInput from "../ui/TextInput/TextInput";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { apiKeyAtom } from "../../state/atoms/apiKeyAtom";
import { playerDataAtom } from "../../state/atoms/playerDataAtom";

import * as styles from "./LogIn.module.css";
import { ROUTES } from "../../core/Routes";
import { authService } from "../../api/auth";

const Login = () => {
    // Getters for recoil
    const apiKey = useRecoilValue(apiKeyAtom);

    // Setters for recoil
    const setApiKey = useSetRecoilState(apiKeyAtom);
    const setPlayerData = useSetRecoilState(playerDataAtom);

    // States for UI
    const [playerName, setPlayerName] = useState("");
    const [apiKeyInput, setApiKeyInput] = useState(apiKey || "");

    const navigate = useNavigate(); // Initialize useNavigate

    // Login function
    const handleLogin = async () => {
        try {
            const data = await authService.login(apiKeyInput);
            console.log("Login response:", data); // Log response for debugging

            if (data.success) {
                setApiKey(apiKeyInput);
                setPlayerData({ id: data.playerId });
                navigate(ROUTES.ORGS);
            } else {
                alert("Login failed: " + data.error);
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("An error occurred during login.");
        }
    };

    // Registration function
    const handleRegister = async () => {
        try {
            const data = await   authService.register(playerName)
            console.log("Register response:", data); // Log response for debugging

            if (data.success) {
                setApiKey(data.apiKey);
                setPlayerData({ id: data.playerId });
                navigate(ROUTES.ORGS);
            } else {
                alert("Registration failed: " + data.error);
            }
        } catch (error) {
            console.error("Error during registration:", error);
            alert("An error occurred during registration.");
        }
    };

    const handleKeyPress = (e: any) => {
        if (e.key === "Enter") {
            e.preventDefault(); // Prevent default form submission

            if (e.target.name === "login") {
                console.log("Login key press detected");
                handleLogin();
            } else if (e.target.name === "register") {
                console.log("Register key press detected");
                handleRegister();
            }
        }
    };

    return (
        <div className={styles.login}>
            <Card>
                <TextInput
                    name="login"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    onKeyDown={handleKeyPress}
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
                    name="register"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    onKeyDown={handleKeyPress}
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
