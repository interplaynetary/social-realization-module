import React, { useState, useEffect } from "react";
import OrgDetail from "./OrgDetail";
import Button from "./ui/Button/Button";
import Container from "./ui/Container/Container";

const OrgList = ({ apiKey, playerId }) => {
    const [orgs, setOrgs] = useState([]);
    const [currentOrg, setCurrentOrg] = useState(null);

    useEffect(() => {
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
            {orgs.map((org) => (
                <div key={org.id}>
                    <h3>{org.name}</h3>

                    <p>Phase: {org.currentPhase}</p>

                    {org.players.hasOwnProperty(playerId) ? (
                        <Button onClick={() => setCurrentOrg(org)}>
                            View Org
                        </Button>
                    ) : (
                        <Button onClick={() => handleJoinOrg(org.id)}>
                            Join Org
                        </Button>
                    )}
                </div>
            ))}

            {currentOrg && (
                <OrgDetail
                    org={currentOrg}
                    apiKey={apiKey}
                    playerId={playerId}
                />
            )}
        </Container>
    );
};

export default OrgList;
