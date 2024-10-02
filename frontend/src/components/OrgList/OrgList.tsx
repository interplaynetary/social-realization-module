import { useState, useEffect } from "react";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { fetchOrgs, joinOrg } from "../../api/api";
import { getPlayersNameById } from "../../helpers/helpers";
import { apiKeyAtom } from "../../state/atoms/apiKeyAtom";
import { playerDataAtom } from "../../state/atoms/playerDataAtom";
import { selectedOrgAtom } from "../../state/atoms/selectedOrgAtom"; // New atom for the current organization
import OrgDetail from "../OrgDetail/OrgDetail";
import Overlay from "../Overlay/Overlay";
import Button from "../ui/Button/Button";
import Card from "../ui/Card/Card";
import Container from "../ui/Container/Container";
import * as styles from "./OrgList.module.css";
import { useParams, useNavigate } from "react-router-dom";
import Headline from "../ui/Headline/Headline";
import { ROUTES } from "../../core/Routes";

type Org = {
    id: string;
    name: string;
    currentPhase: string;
    players: Record<string, any>;
    currentCycle: string;
    goals: Record<string, any>;
    offers: Record<string, any>;
    potentialValue: number;
    realizedValue: number;
    shares: number;
};

type OrgParams = {
    orgId?: string; // Optional param, might not always be in the route
};

// first i fetch all orgs
// then player can "join" org, as a post,
// then i fetch again all orgs, to get the changes
const OrgList = () => {
    const [orgs, setOrgs] = useState<Org[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const apiKey = useRecoilValue(apiKeyAtom);
    const playerData = useRecoilValue(playerDataAtom);
    const selectedOrg = useRecoilValue(selectedOrgAtom);
    const setSelectedOrg = useSetRecoilState(selectedOrgAtom);
    const setPlayerData = useSetRecoilState(playerDataAtom);

    const { orgId } = useParams<OrgParams>(); // Capture orgId from URL params
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrgRegistry();
    }, []);

    // If orgId is present in the URL, open the modal for that org
    useEffect(() => {
        if (orgId) {
            const org = orgs.find((org) => org.id === orgId);
            org && setSelectedOrg(org);
        }
    }, [orgId, orgs]); // Triggered when orgId or orgs changes

    const fetchOrgRegistry = async () => {
        setLoading(true);

        try {
            const data = await fetchOrgs();

            if (data.success) {
                setOrgs(data.registryData);
                setPlayersName();
                setError(null); // Reset error if fetch is successful
            } else {
                setError("Failed to fetch organizations");
            }
        } catch (err) {
            setError("An error occurred while fetching organizations");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinOrg = async (orgId: string) => {
        try {
            const data = await joinOrg(orgId, apiKey);

            if (data.success) {
                // Update the org state without refetching all organizations
                setOrgs((prevOrgs) =>
                    prevOrgs.map((org) =>
                        org.id === orgId
                            ? {
                                  ...org,
                                  players: {
                                      ...org.players,
                                      [playerData.id]: true,
                                  },
                              } // Update the players
                            : org
                    )
                );
            } else {
                alert("Failed to join organization");
            }
        } catch (error) {
            alert("An error occurred while joining the organization");
        }
    };

    const handleViewOrg = (org: Org) => {
        if (selectedOrg?.id === org.id) {
            setSelectedOrg(null);
            navigate(ROUTES.LOGIN);
        } else {
            setSelectedOrg(org);
            navigate(`${ROUTES.ORGS}${org.id}/`);
        }
    };

    const setPlayersName = () => {
        const { id, name: playerName } = playerData;
        const registryName = getPlayersNameById(orgs, id);
        const name = playerName || registryName;

        // Only update if there's a change in player data
        if (playerName !== name) {
            setPlayerData({ id, name });
        }
    };

    const handleClose = () => {
        // Use navigate to go back to the previous route
        navigate(-1); // This will act like history.goBack()
    };

    return (
        <Container>
            <div className={styles.orgs}>
                {loading && <p>Loading organizations...</p>}

                {error && <p>{error}</p>}

                {orgs.map((org) => (
                    <Card key={org.id}>
                        <div>
                            <Headline level="h3">{org.name}</Headline>
                            <p>Phase: {org.currentPhase}</p>

                            {org.players.hasOwnProperty(playerData.id) ? (
                                <Button
                                    variant="primary"
                                    onClick={() => handleViewOrg(org)}
                                >
                                    {selectedOrg?.id === org.id
                                        ? "Close Org"
                                        : "View Org"}
                                </Button>
                            ) : (
                                <Button onClick={() => handleJoinOrg(org.id)}>
                                    Join Org
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {selectedOrg && (
                <Overlay
                    onClose={() => {
                        setSelectedOrg(null);
                        handleClose(); // Close modal and return to root route
                    }}
                >
                    <OrgDetail
                        org={selectedOrg}
                        apiKey={apiKey}
                        playerId={playerData.id}
                    />
                </Overlay>
            )}
        </Container>
    );
};

export default OrgList;
