import PhaseActions from "../PhaseActions";
import PlayerCard from "../PlayerCard";
import GoalCard from "../GoalCard";
import { useRecoilValue } from "recoil";
import { apiKeyAtom } from "../../state/atoms/apiKeyAtom";
import Card from "../ui/Card/Card";
import Button from "../ui/Button/Button";
import { playerDataAtom } from "../../state/atoms/playerDataAtom";
import { runPhaseShift } from "../../api/api";

import * as classes from "./OrgDetail.module.css";

const OrgDetail = ({ org, apiKey, playerId }) => {
    console.log({ apiKey, playerId });

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
        <div className={classes.orgDetails}>
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
        </div>
    );
};

export default OrgDetail;
