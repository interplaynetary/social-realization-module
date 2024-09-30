import PhaseActions from "./PhaseActions";
import PlayerCard from "./PlayerCard";
import GoalCard from "./GoalCard";
import { useRecoilValue } from "recoil";
import { apiKeyAtom } from "../state/atoms/apiKeyAtom";
import Card from "./ui/Card/Card";
import Button from "./ui/Button/Button";
import { playerDataAtom } from "../state/atoms/playerDataAtom";
import { runPhaseShift } from "../api/api";

const OrgDetail = ({ org }) => {
    const apiKey = useRecoilValue(apiKeyAtom);
    const playerData = useRecoilValue(playerDataAtom);

    console.log({ apiKey, playerData });

    const handlePhaseShift = async () => {
        const data = await runPhaseShift(apiKey);

        if (data.success) {
            console.log(data, "data");
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

            <PhaseActions org={org} apiKey={apiKey} playerId={playerData.id} />

            <PlayerCard org={org} />

            {false && <GoalCard org={org} />}

            {playerData.id === org.id && (
                <Button variant="secondary" onClick={handlePhaseShift}>
                    Shift Phase
                </Button>
            )}
        </Card>
    );
};

export default OrgDetail;
