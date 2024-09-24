import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginView from "./views/LoginView";
import DashboardView from "./views/DashboardView";
import { RecoilRoot } from "recoil";
import Header from "./components/Header/Header";

const App = () => {
    return (
        <RecoilRoot>
            <Router>
                <Header />

                <Routes>
                    <Route path="/" element={<LoginView />} />
                    <Route path="/dashboard" element={<DashboardView />} />
                </Routes>
            </Router>
        </RecoilRoot>
    );
};

export default App;
