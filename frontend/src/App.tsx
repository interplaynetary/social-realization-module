import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginView from "./views/LoginView";
import DashboardView from "./views/DashboardView";
import { RecoilRoot } from "recoil";
import Logo from "./components/ui/Logo/Logo";

const App = () => {
    return (
        <RecoilRoot>
            <Logo />

            <Router>
                <Routes>
                    <Route path="/" element={<LoginView />} />
                    <Route path="/dashboard" element={<DashboardView />} />
                </Routes>
            </Router>
        </RecoilRoot>
    );
};

export default App;
