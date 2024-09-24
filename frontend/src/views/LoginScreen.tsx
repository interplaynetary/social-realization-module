import * as React from "react";
import Login from "../components/LogIn/LogIn";

const LoginScreen = () => {
    const [apiKey, setApiKey] = useState("");
    const [playerId, setPlayerId] = useState("");
    
    return (
        <div>
            <Login />
        </div>

    );
};

export default LoginScreen;
