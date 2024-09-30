import OrgDetail from "../components/OrgDetail";
import Container from "../components/ui/Container/Container";

// render orgDetailView, maybe as an overlay on top of dashboard?
const OrgDetailView = () => {
    const apiKey = useRecoilState()
    return (
        <div>
            <Container>
                <h1>Welcome to OrgDetail</h1>

                <OrgDetail />
            </Container>
            eheheh
        </div>
    );
};

export default OrgDetailView;
