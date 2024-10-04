import OrgDetail from "../components/OrgDetail/OrgDetail";
import Container from "../components/ui/Container/Container";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { apiKeyAtom } from "../state/atoms/apiKeyAtom";
import { useRecoilState } from "recoil";

// render orgDetailView, maybe as an overlay on top of dashboard?
// TODO
/*

-> get OrgID from route ( dashboard, through link )
-> with orgID, get the right ORG from registry ( maybe from state ? )
-> pass down to orgDetail, somehow make visible the orgDetailView :)

*/
const OrgDetailView = () => {
    const apiKey = useRecoilState(apiKeyAtom);

    const { orgId } = useParams();

    useEffect(() => {
        console.log(orgId);
    }, []);

    return (
        <div>
            <Container>
                <h1>Welcome to OrgDetail</h1>

                <OrgDetail org={orgId} />
            </Container>
            eheheh
        </div>
    );
};

export default OrgDetailView;
