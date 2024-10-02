import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginView from "./views/LoginView";
import DashboardView from "./views/DashboardView";
import OrgDetailView from "./views/OrgDetailView";
import { RecoilRoot } from "recoil";
import Header from "./components/Header/Header";
import { ROUTES } from "./core/Routes";

const App = () => {
    return (
        <RecoilRoot>
            <Router>
                <Header />

                <Routes>
                    <Route path={ROUTES.LOGIN} element={<LoginView />} />
                    <Route path={ROUTES.ORGS} element={<DashboardView />} />
                    <Route path={ROUTES.ORG} element={<DashboardView />} />
                </Routes>
            </Router>
        </RecoilRoot>
    );
};

export default App;
