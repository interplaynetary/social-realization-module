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
import { useEffect, useState } from "react";
import OfferInfo from "../OfferInfo/OfferInfo";
import JSOG from 'jsog';
import { palette } from "../PlayerInfo/PlayerInfoColorPalette"; // Assuming you have a color palette

//const allocator = true;

const OrgDetail: React.FunctionComponent<{
    org: Org;
    currentOrg?: any;
    apiKey: ApiKey;
    playerId: any;
}> = ({ org, currentOrg, apiKey, playerId }) => {
    const [playerColors, setPlayerColors] = useState<Record<string, string>>({});

    useEffect(() => {
        // Shuffle the palette and assign a unique color to each player
        const shuffledPalette = [...palette].sort(() => 0.5 - Math.random());

        const colors = Object.keys(org.players).reduce((acc, playerId, index) => {
            acc[playerId] = shuffledPalette[index % shuffledPalette.length];
            return acc;
        }, {} as Record<string, string>);

        setPlayerColors(colors);
    }, [org.players]);

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

            <PhaseActions org={JSOG.decode(org)} apiKey={apiKey} playerId={playerId} />

            {/* {
                <Allocator
                    potentialValue={0}
                    maxPotentialAllocatableByPlayer={0}
                />
            } */}

            {(org.currentPhase === "goalExpression") && currentOrg && (
                <>
                    <Headline level="h4">Goals</Headline>
                    <GoalInfo org={JSOG.decode(currentOrg)} playerColors={playerColors} playerId={playerId} />
                </>
            )}

            {org.currentPhase == "offerExpression" && currentOrg && (
                <>
                    <Headline level="h4">Offers</Headline>
                    <OfferInfo org={JSOG.decode(currentOrg)} playerColors={playerColors} />
                </>
            )}

            {/* Here we will add phase specific actions for player as org: issue-potential, issue shares, distribute share, settings: max-goals-per-player etc.*/}
            {playerId === org.id && (
                <Button variant="secondary" onClick={handlePhaseShift}>
                    Shift Phase
                </Button>
            )}

            <PlayerInfo org={org}/>
        </div>
    );
};

export default OrgDetail;
