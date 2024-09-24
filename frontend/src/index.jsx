import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { RecoilRoot } from "recoil";

import "./styles/index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

function App() {
    return <CharacterCounter />;
}

root.render(
    <React.StrictMode>
        <RecoilRoot>
            <Router>
                <App />
            </Router>
        </RecoilRoot>
    </React.StrictMode>
);
