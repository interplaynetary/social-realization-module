import Button from "../ui/Button/Button";
import PlayerInfo from "../PlayerInfo/PlayerInfo";
import PhaseActions from "../PhaseActions/PhaseActions";
import Headline from "../ui/Headline/Headline";
import GoalInfo from "../GoalInfo/GoalInfo";
import { ApiKey, Org } from "../../../../sharedTypes";
import * as classes from "./OrgDetail.module.css";
import Tag from "../ui/Tag/Tag";
import { organizationService } from "../../api/organisation";
import Allocator from "../ui/Allocator/Allocator";
import { useEffect } from "react";

const allocator = true;

const OrgDetail: React.FunctionComponent<{
    org: Org;
    currentOrg?: any;
    apiKey: ApiKey;
    playerId: any;
}> = ({ org, currentOrg, apiKey, playerId }) => {

    useEffect(() => {
        console.log(currentOrg, "currentOrg!!")
    }, [currentOrg])

    const handlePhaseShift = async () => {
        const data = await organizationService.runPhaseShift();

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

            {
                <Allocator
                    potentialValue={0}
                    maxPotentialAllocatableByPlayer={0}
                />
            }

            {currentOrg && <GoalInfo org={currentOrg} />}

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
