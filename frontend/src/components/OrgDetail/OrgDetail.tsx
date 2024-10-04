import Button from "../ui/Button/Button";
import PlayerInfo from "../PlayerInfo/PlayerInfo";
import PhaseActions from "../PhaseActions/PhaseActions";
import Headline from "../ui/Headline/Headline";
import GoalInfo from "../GoalInfo/GoalInfo";
import { runPhaseShift } from "../../api/api";
import { ApiKey, Org } from "../../../../sharedTypes";
import * as classes from "./OrgDetail.module.css";

const OrgDetail: React.FunctionComponent<{
    org: Org;
    apiKey: ApiKey;
    playerId: any;
}> = ({ org, apiKey, playerId }) => {
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

            <GoalInfo org={org} />

            {playerId === org.id && (
                <Button variant="secondary" onClick={handlePhaseShift}>
                    Shift Phase
                </Button>
            )}

            <PlayerInfo org={org} />
        </div>
    );
};

export default OrgDetail;
