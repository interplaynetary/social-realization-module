import { useState, useEffect } from "react";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { fetchOrgs, joinOrg } from "../../api/api";
import { apiKeyAtom } from "../../state/atoms/apiKeyAtom";
import { playerDataAtom } from "../../state/atoms/playerDataAtom";
import { selectedOrgAtom } from "../../state/atoms/selectedOrgAtom"; // New atom for the current organization
import OrgDetail from "../OrgDetail/OrgDetail";
import Button from "../ui/Button/Button";
import Card from "../ui/Card/Card";
import Container from "../ui/Container/Container";
import * as styles from "./OrgList.module.css";

type Org = {
    id: string;
    name: string;
    currentPhase: string;
    players: Record<string, any>;
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
    const selectedOrg = useRecoilValue(selectedOrgAtom); // New Recoil value for selected org
    const setSelectedOrg = useSetRecoilState(selectedOrgAtom); // Recoil setter for selected org

    useEffect(() => {
        fetchOrgRegistry();
    }, []);

    const fetchOrgRegistry = async () => {
        setLoading(true);

        try {
            const data = await fetchOrgs();

            console.log(data, "???");

            if (data.success) {
                setOrgs(data.registryData);
                console.log("get fetched orgs:", data.registryData); // Log to check data
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
        // Toggle the organization details when the same org is clicked again
        if (selectedOrg?.id === org.id) {
            setSelectedOrg(null); // Deselect the org (close the details view)
        } else {
            setSelectedOrg(org); // Set the new org and show its details
        }
    };

    return (
        <Container>
            <div className={styles.orgs}>
                {loading && <p>Loading organizations...</p>}

                {error && <p>{error}</p>}

                {orgs.map((org) => (
                    <Card key={org.id}>
                        <div>
                            <h3>{org.name}</h3>
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
                <OrgDetail
                    org={selectedOrg}
                    apiKey={apiKey}
                    playerId={playerData.id}
                />
            )}
        </Container>
    );
};

export default OrgList;
