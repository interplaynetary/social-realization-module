import PhaseActions from "./PhaseActions";
import PlayerCard from "./PlayerCard";
import GoalCard from "./GoalCard";
import { useRecoilValue } from "recoil";
import { apiKeyAtom } from "../state/atoms/apiKeyAtom";
import { playerDataAtom } from "../state/atoms/playerDataAtom";
import Card from "./ui/Card/Card";
import Button from "./ui/Button/Button";

const OrgDetail = ({ org, apiKey, playerId }) => {
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
        <Card>
            <h2>{org.name}</h2>
            <p>Cycle: {org.currentCycle}</p>
            <p>Phase: {org.currentPhase}</p>
            <p>Potential Value: {org.potentialValue}</p>
            <p>Realized Value: {org.realizedValue}</p>
            <p>Shares: {org.shares}</p>

            <PhaseActions org={org} apiKey={apiKey} playerId={playerId} />
            <PlayerCard org={org} />

            {false && <GoalCard org={org} />}

            {playerId === org.id && (
                <Button variant="secondary" onClick={handlePhaseShift}>
                    Shift Phase
                </Button>
            )}
        </Card>
    );
};

export default OrgDetail;
