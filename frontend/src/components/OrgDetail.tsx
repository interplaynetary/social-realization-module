import React from "react";
import PhaseActions from "./PhaseActions";
import PlayerCard from "./PlayerCard";
import GoalCard from "./GoalCard";
import { useRecoilValue } from "recoil";
import { apiKeyAtom } from "../state/atoms/apiKeyAtom";
import { playerDataAtom } from "../state/atoms/playerDataAtom";

const OrgDetail = ({ org }) => {
    const apiKey = useRecoilValue(apiKeyAtom); // Get the apiKey from Recoil
    const playerId = useRecoilValue(playerDataAtom); // Get the playerId from Recoil

    const handlePhaseShift = async () => {
        const response = await fetch("http://localhost:3000/player-action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                apiKey,
                actionType: "runPhaseShift",
                actionParams: [],
            }),
        });

        const data = await response.json();

        if (data.success) {
            // Refresh the org data
        } else {
            alert("Failed to shift phase");
        }
    };

    return (
        <div>
            <h2>{org.name}</h2>
            <p>Cycle: {org.currentCycle}</p>
            <p>Phase: {org.currentPhase}</p>
            <p>Potential Value: {org.potentialValue}</p>
            <p>Realized Value: {org.realizedValue}</p>
            <p>Shares: {org.shares}</p>

            <PhaseActions org={org} apiKey={apiKey} playerId={playerId} />
            <PlayerCard org={org} />
            <GoalCard org={org} />

            {playerId === org.id && (
                <button onClick={handlePhaseShift}>Shift Phase</button>
            )}
        </div>
    );
};

export default OrgDetail;
