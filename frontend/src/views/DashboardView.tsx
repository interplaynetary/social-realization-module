import OrgList from "../components/OrgList/OrgList";
import PlayerInfo from "../components/PlayerInfo/PlayerInfo";
import Container from "../components/ui/Container/Container";

const Dashboard = () => {
    return (
        <div>
            <Container>
                <h1>Welcome to the Dashboard</h1>
            </Container>

            <OrgList />
            
            <PlayerInfo />
        </div>
    );
};

export default Dashboard;
