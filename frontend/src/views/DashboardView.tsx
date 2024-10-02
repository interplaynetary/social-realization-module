import { useEffect } from "react";
import OrgList from "../components/OrgList/OrgList";
import PlayerInfo from "../components/PlayerInfo/PlayerInfo";
import Container from "../components/ui/Container/Container";
import PageHeadline from "../components/ui/PageHeadline.tsx/PageHeadline";

const Dashboard = () => {
    return (
        <div>
            <Container>
                <PageHeadline>All Organisations</PageHeadline>
            </Container>

            <OrgList />

            <PlayerInfo />
        </div>
    );
};

export default Dashboard;
