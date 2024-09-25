import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { apiKeyAtom } from "../../state/atoms/apiKeyAtom";
import { playerDataAtom } from "../../state/atoms/playerDataAtom";
import OrgDetail from "../OrgDetail";
import Button from "../ui/Button/Button";
import Card from "../ui/Card/Card";
import Container from "../ui/Container/Container";

import * as styles from "./OrgList.module.css";

type org = {
    id: string;
    name: string;
    currentPhase: string;
    players: any;
};

const OrgList = () => {
    const [orgs, setOrgs] = useState([]);
    const [currentOrg, setCurrentOrg] = useState(null);

    const apiKey = useRecoilValue(apiKeyAtom);
    const playerId = useRecoilValue(playerDataAtom);

    useEffect(() => {
        console.log({ apiKey, playerId });
        fetchOrgRegistry();
    }, []);

    const fetchOrgRegistry = async () => {
        const response = await fetch("http://localhost:3000/get-org-registry");
        const data = await response.json();

        if (data.success) {
            setOrgs(data.registryData);
        } else {
            alert("Failed to fetch organizations");
        }
    };

    const handleJoinOrg = async (orgId) => {
        const response = await fetch("http://localhost:3000/player-action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                apiKey: apiKey,
                actionType: "joinOrg",
                actionParams: [orgId],
            }),
        });

        const data = await response.json();

        if (data.success) {
            fetchOrgRegistry(); // Refresh the org list after joining
        } else {
            alert("Failed to join organization");
        }
    };

    return (
        <Container>
            <div className={styles.orgs}>
                {orgs.map((org, i) => (
                    <Card>
                        <div key={org.name + i}>
                            <h3>{org.name}</h3>

                            <p>Phase: {org.currentPhase}</p>

                            {org.players.hasOwnProperty(playerId) ? (
                                <Button
                                    variant="primary"
                                    onClick={() => setCurrentOrg(org)}
                                >
                                    View Org
                                </Button>
                            ) : (
                                <Button onClick={() => handleJoinOrg(org.id)}>
                                    Join Org
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}

                {currentOrg && <OrgDetail org={currentOrg} />}
            </div>
        </Container>
    );
};

export default OrgList;
