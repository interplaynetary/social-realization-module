import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Button from "../ui/Button/Button";
import Card from "../ui/Card/Card";
import TextInput from "../ui/TextInput/TextInput";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { apiKeyAtom } from "../../state/atoms/apiKeyAtom";
import { playerDataAtom } from "../../state/atoms/playerDataAtom"; // Adjusted import

import * as styles from "./LogIn.module.css";
import { authenticate, registerUser } from "../../api/api";

const Login = () => {
    const apiKey = useRecoilValue(apiKeyAtom);

    const setApiKey = useSetRecoilState(apiKeyAtom);
    const setPlayerData = useSetRecoilState(playerDataAtom); // Ensure this is an atom

    const [playerName, setPlayerName] = useState("");
    const [apiKeyInput, setApiKeyInput] = useState(apiKey || "");

    const navigate = useNavigate(); // Initialize useNavigate

    // login currently works with api key
    const handleLogin = async () => {
        const data = await authenticate(apiKeyInput);

        if (data.success) {
            // Set in Recoil state
            setApiKey(apiKeyInput);

            console.log(data, "Login Data");
            setPlayerData({
                id: data.playerId,
            });

            navigate("/dashboard");
        } else {
            alert("Login failed: " + data.error);
        }
    };

    const handleRegister = async () => {
        const data = await registerUser(playerName);

        if (data.success) {
            console.log(data.apiKey, "registerKey!");
            // Set in Recoil state
            setApiKey(data.apiKey);
            setPlayerData({
                id: data.id,
                name: playerName,
            });

            navigate("/dashboard");
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
