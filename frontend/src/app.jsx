import React, { useState } from "react";
import Login from "./components/Login";
import OrgList from "./components/OrgList";

const App = () => {
  const [apiKey, setApiKey] = useState("");
  const [playerId, setPlayerId] = useState("");

  return (
    <div>xxx
      {!apiKey ? (
        <Login setApiKey={setApiKey} setPlayerId={setPlayerId} />
      ) : (
        <OrgList apiKey={apiKey} playerId={playerId} />
      )}
    </div>
  );
};

export default App;
