import Button from "../ui/Button/Button";
import PlayerInfo from "../PlayerInfo/PlayerInfo";
import PhaseActions from "../PhaseActions/PhaseActions";
import Headline from "../ui/Headline/Headline";
import GoalInfo from "../GoalInfo/GoalInfo";
import { ApiKey, Org } from "../../../../sharedTypes";
import * as classes from "./OrgDetail.module.css";
import Tag from "../ui/Tag/Tag";
import { organizationService } from "../../api/organisation";
import { useEffect, useState } from "react";
import OfferInfo from "../OfferInfo/OfferInfo";
import JSOG from 'jsog';
import { palette } from "../PlayerInfo/PlayerInfoColorPalette"; // Assuming you have a color palette
import Card from "../ui/Card/Card";
import { useRecoilState } from "recoil";
import { currentOrgAtom } from "../../state/atoms/currentOrgAtom";
//const allocator = true;

const OrgDetail: React.FunctionComponent<{
    org: Org;
    currentOrg?: any;
    apiKey: ApiKey;
    playerId: any;
}> = ({ org: initialOrg, currentOrg, apiKey, playerId }) => {
    const [playerColors, setPlayerColors] = useState<Record<string, string>>({});
    const [currentOrgState, setCurrentOrgState] = useRecoilState(currentOrgAtom);

    const org = currentOrgState || initialOrg;

    useEffect(() => {
        // Update color assignments when players change
        if(org?.players) {
            const shuffledPalette = [...palette].sort(() => 0.5 - Math.random());
            const colors = Object.keys(org.players).reduce((acc, playerId, index) => {
                acc[playerId] = shuffledPalette[index % shuffledPalette.length];
                return acc;
            }, {} as Record<string, string>);
            setPlayerColors(colors);
        }
    }, [org?.players]);

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

    const handleAcceptOffer = async (offerId: string) => {
        try {
            const response = await organizationService.acceptOffer(offerId);
            
            // Refresh org data
            const updatedOrgData = await organizationService.getOrgById(org.id);
            if (updatedOrgData.success) {
                setCurrentOrgState(updatedOrgData.organization);
            }

        } catch (error) {
            console.error("Error accepting offer:", error);
            alert(`Error accepting offer: ${error.message}`);
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

            {/* Org-specific actions */}
            {playerId === org.id && (
                <div className={classes.orgActions}>
                    <Headline level="h4">Organization Actions</Headline>
                    <div className={classes.offersGrid}>
                        {Object.entries(JSOG.decode(org).offers || {}).map(([offerId, offer]: [string, any]) => {
                            const isPending = !offer?.status || offer?.status === 'pending';
                            const potentialValue = offer?.orgData?.[org.id]?.[org.currentCycle]?.potentialValue || 0;
                            const ask = offer?.orgData?.[org.id]?.[org.currentCycle]?.ask || 0;
                            const credits = offer?.orgData?.[org.id]?.[org.currentCycle]?.credits || 0;
                            
                            return (
                                <Card key={offerId} className={classes.offerCard}>
                                    <div className={`${classes.offerStatus} ${classes[`status${offer?.status || 'Pending'}`]}`}>
                                        {offer?.status || 'Pending'}
                                    </div>
                                    <h6>{offer.name}</h6>
                                    <p>{offer.description}</p>
                                    <p><strong>Effects:</strong> {offer.effects}</p>
                                    <p><strong>Potential Value:</strong> {potentialValue}</p>
                                    <p><strong>Credit Ask:</strong> {ask}</p>
                                    {offer.status === 'accepted' && <p><strong>Credit Recieved:</strong> {credits}</p>}
                                    
                                    {isPending && potentialValue > 0 && (
                                        <Button 
                                            onClick={() => handleAcceptOffer(offerId)}
                                            variant="primary"
                                        >
                                            {potentialValue >= ask ? 'Accept Offer' : 'Counter Offer'}
                                        </Button>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                    {/* Phase shift button */}
                    <Button variant="secondary" onClick={handlePhaseShift}>
                        Shift Phase
                    </Button>
                    {/* Add Settings Button */}
                </div>
            )}

            <PlayerInfo org={org}/>
        </div>
    );
};

export default OrgDetail;
