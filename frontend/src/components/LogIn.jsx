import React, { useState } from "react";

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
    <div>
      <input
        type="text"
        value={apiKeyInput}
        onChange={(e) => setApiKeyInput(e.target.value)}
        placeholder="Enter API Key"
      />
      <button onClick={handleLogin}>Log In</button>
      <br />
      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Enter Name"
      />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default Login;
