import OrgList from "../components/OrgList/OrgList";
import Container from "../components/ui/Container/Container";

const Dashboard = () => {
    return (
        <div>
            <Container>
                <h1>Welcome to the Dashboard</h1>
            </Container>

            <OrgList />
        </div>
    );
};

export default Dashboard;
