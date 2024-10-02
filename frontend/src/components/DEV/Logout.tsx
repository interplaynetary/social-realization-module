import { useNavigate } from "react-router";
import { useResetRecoilState } from "recoil";
import { ROUTES } from "../../core/Routes";
import { apiKeyAtom } from "../../state/atoms/apiKeyAtom";
import Container from "../ui/Container/Container";

const LogoutComponent = () => {
    const resetApiKey = useResetRecoilState(apiKeyAtom);
    const navigate = useNavigate();

    const logout = () => {
        resetApiKey(); // This will reset Recoil state and clear localStorage via the atom effect

        navigate(ROUTES.LOGIN);
    };

    return (
        <Container>
            <button onClick={logout} style={{marginBottom: 100, marginTop: 20}}>Logout</button>
        </Container>
    );
};

export default LogoutComponent;
