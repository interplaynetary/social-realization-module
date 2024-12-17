import { useState, useEffect } from "react";
import { useSetRecoilState, useRecoilValue, useRecoilState } from "recoil";
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
import { organizationService } from "../../api/organisation";
import { Org } from "../../../../sharedTypes";
import { currentOrgAtom } from "../../state/atoms/currentOrgAtom";

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

    const [currentOrg, setCurrentOrg] = useRecoilState(currentOrgAtom);

    const { orgId } = useParams<OrgParams>(); // Capture orgId from URL params
    const navigate = useNavigate();

    // Fetch organizations only when playerData.id is set
    useEffect(() => {
        if (playerData.id) {
            fetchOrgRegistry();
        }
    }, [playerData.id]); // Trigger when playerData.id changes

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
            const data = await organizationService.getOrgRegistry();

            if (data.success) {
                setOrgs(data.registryData);
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
            const data = await organizationService.joinOrg(orgId);
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
            console.log(
                "An error occurred while joining the organization",
                error
            );
        }
    };

    const handleViewOrg = (org: Org) => {
        if (selectedOrg?.id === org.id) {
            setSelectedOrg(null);
            navigate(ROUTES.LOGIN);
        } else {
            console.log(org.id);
            setSelectedOrg(org);
            getOrg(org.id);
            navigate(`${ROUTES.ORGS}${org.id}/`);
        }
    };

    const getOrg = async (orgId: string) => {
        try {
            const data = await organizationService.getOrgById(orgId);

            if (data.success) {
                const org = data["organization"];

                setCurrentOrg(org);

                // todo: improve how goals are set; maybe create recoil for curretOrg data?
                console.log(org, "data2???");

                console.log("update it all!");

            } else {
                alert("Failed to view organization");
            }
        } catch (error) {
            console.log(
                "An error occurred while viewing the organization",
                error
            );
        }
    };

    const handleClose = () => {
        navigate(-1); // This will act like history.goBack()
    };

    return (
        <Container>
            <div className={styles.orgs}>
                {loading && <p>Loading organizations...</p>}
                {error && <p>{error}</p>}

                {playerData.id &&
                    orgs.map((org) => {
                        const isPlayerInOrg = Boolean(
                            org.players[playerData.id]
                        );

                        return (
                            <Card key={org.id} className={styles.orgCard}>
                                <div>
                                    <Headline level="h3">{org.name}</Headline>
                                    <span className={styles.phase}>
                                        phase: {org.currentPhase}
                                    </span>

                                    {isPlayerInOrg ? (
                                        <Button
                                            variant="primary"
                                            onClick={() => handleViewOrg(org)}
                                        >
                                            {selectedOrg?.id === org.id
                                                ? "Close Org"
                                                : "View Org"}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() =>
                                                handleJoinOrg(org.id)
                                            }
                                        >
                                            Join Org
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
            </div>

            {selectedOrg && (
                <Overlay
                    onClose={() => {
                        setSelectedOrg(null);
                        handleClose(); // Close modal and return to root route
                    }}
                >
                    <OrgDetail
                        currentOrg={currentOrg}
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
