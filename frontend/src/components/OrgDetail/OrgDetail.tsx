import GoalCard from "../GoalCard";
import { useRecoilValue } from "recoil";
import { apiKeyAtom } from "../../state/atoms/apiKeyAtom";
import Card from "../ui/Card/Card";
import Button from "../ui/Button/Button";
import { playerDataAtom } from "../../state/atoms/playerDataAtom";
import { runPhaseShift } from "../../api/api";

import * as classes from "./OrgDetail.module.css";
import PlayerCard from "../PlayerCard/PlayerCard";
import PhaseActions from "../PhaseActions/PhaseActions";
import Headline from "../ui/Headline/Headline";

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
            <Headline level="h3">{org.name}</Headline>

            {/* TODO: sort this, prioritize what is most important */}
            <div className={classes.orgInfo}>
                <span className={classes.orgInfoItem}>
                    Cycle: {org.currentCycle}
                </span>

                <span className={classes.orgInfoItem}>
                    Phase: {org.currentPhase}
                </span>

                <span className={classes.orgInfoItem}>
                    Realized Value: {org.realizedValue}
                </span>

                <span className={classes.orgInfoItem}>
                    Potential Value: {org.potentialValue}
                </span>

                <span className={classes.orgInfoItem}>
                    Shares: {org.shares}
                </span>
            </div>

            <PhaseActions org={org} apiKey={apiKey} playerId={playerId} />

            <GoalCard org={org} />

            {playerId === org.id && (
                <Button variant="secondary" onClick={handlePhaseShift}>
                    Shift Phase
                </Button>
            )}

            <PlayerCard org={org} />
        </div>
    );
};

export default OrgDetail;
