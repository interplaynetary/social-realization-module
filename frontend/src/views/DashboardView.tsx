import { useEffect } from "react";
import LogoutComponent from "../components/DEV/Logout";
import OrgList from "../components/OrgList/OrgList";
import PlayerInfo from "../components/PlayerInfo/PlayerInfo";
import Container from "../components/ui/Container/Container";
import PageHeadline from "../components/ui/PageHeadline.tsx/PageHeadline";
import { CONFIG } from "../core/Config";

const Dashboard = () => {
    return (
        <div>
            <Container>
                <PageHeadline>All Organisations</PageHeadline>
            </Container>

            <OrgList />

            {CONFIG.dev && <LogoutComponent />}
        </div>
    );
};

export default Dashboard;
