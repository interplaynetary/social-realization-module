import Button from "../ui/Button/Button";
import PlayerInfo from "../PlayerInfo/PlayerInfo";
import PhaseActions from "../PhaseActions/PhaseActions";
import Headline from "../ui/Headline/Headline";
import GoalInfo from "../GoalInfo/GoalInfo";
import { runPhaseShift } from "../../api/api";
import { ApiKey, Org } from "../../../../sharedTypes";
import * as classes from "./OrgDetail.module.css";
import Tag from "../ui/Tag/Tag";

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
                <Tag>Cycle: {org.currentCycle}</Tag>
                <Tag>Phase: {org.currentPhase}</Tag>
                <Tag>Realized Value: {org.realizedValue}</Tag>
                <Tag>Potential Value: {org.potentialValue}</Tag>
                <Tag>Shares: {org.shares}</Tag>
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
