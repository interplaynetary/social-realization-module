import { Fragment, useEffect, useState } from "react";
import Button from "../ui/Button/Button";
import Headline from "../ui/Headline/Headline";
import NumberInput from "../ui/NumberInput/NumberInput";
import TextInput from "../ui/TextInput/TextInput";
import * as classes from "./PhaseActions.module.css";
import { goalService, offerService, organizationService, completionService } from "../../api";
import { currentOrgAtom } from "../../state/atoms/currentOrgAtom";
import { useRecoilState } from "recoil";
import GoalInfo from "../GoalInfo/GoalInfo";
import { palette } from "../PlayerInfo/PlayerInfoColorPalette"; // Assuming you have a color palette
import GoalOfferMapping from "../GoalOfferMapping/GoalOfferMapping";
import { useGoalAllocationCalculations, useOfferAllocationCalculations } from '../../helpers/helpers';
import Card from "../ui/Card/Card";


const initialOfferDetails = {
    offerName: "",
    offerDescription: "",
    offerEffects: "",
    offerAsk: "",
};

const PhaseActions = ({ org, apiKey, playerId }) => {
    const [goalDescription, setGoalDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [offerDetails, setOfferDetails] = useState(initialOfferDetails);
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
    const [goalAllocations, setGoalAllocations] = useState<Record<string, number>>({});
    const [playerColors, setPlayerColors] = useState<Record<string, string>>({});
    const [goalAllocationData, setGoalAllocationData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [offerAllocations, setOfferAllocations] = useState<Record<string, {goalId: string, amount: number}>>({});
    const [offerAllocationData, setOfferAllocationData] = useState(null);

    const [currentOrg, setCurrentOrg] = useRecoilState(currentOrgAtom);

    const handleGoalSelect = (goalId: string) => {
        console.log('Selected goal ID:', goalId);
        
        setSelectedGoals(prev => {
            if (prev.includes(goalId)) {
                return prev.filter(id => id !== goalId);
            }
            return [...prev, goalId];
        });
    };

    const handleProposeGoal = async () => {
        if (!goalDescription.trim()) {
            alert("Please enter a goal description");
            return;
        }

        setIsSubmitting(true);

        try {
            const data = await goalService.proposeGoal(org.id, goalDescription);

            if (data.success) {
                setGoalDescription("");

                const data = await organizationService.getOrgById(org.id);
                setCurrentOrg(data["organization"]);

                const currentCycle = data["organization"].currentCycle;
                console.log(data["organization"].cycles[currentCycle].goals);
            }
        } catch (error) {
            console.error("Failed to propose goal:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitGoalAllocations = async () => {
        try {
            console.log('Starting goal allocation submission with:', goalAllocations);
            
            if (Object.keys(goalAllocations).length === 0) {
                alert("No allocations to submit");
                return;
            }

            const response = await goalService.allocateValues(org.id, goalAllocations);
            console.log('Received response:', response);

            if (response.success) {
                alert("Allocations submitted successfully!");
                setGoalAllocations({});
                
                // Refresh org data
                const data = await organizationService.getOrgById(org.id);
                if (data.success) {
                    setCurrentOrg(data.organization);
                }
            } else {
                console.error('Failed to submit allocations:', response);
                alert("Failed to submit Goal Allocations");
            }
        } catch (error: any) {
            console.error("Error submitting Goal Allocations:", error);
            alert(`Error submitting Goal Allocations: ${error.message}`);
        }
    };

    const handleMakeOffer = async () => {
        if (selectedGoals.length === 0) {
            alert("Please select at least one goal");
            return;
        }

        console.log('Making offer with:', {
            orgId: org.id,
            name: offerDetails.offerName,
            description: offerDetails.offerDescription,
            effects: offerDetails.offerEffects,
            ask: Number(offerDetails.offerAsk),
            targetGoalIds: selectedGoals
        });

        try {
            const offerId = await offerService.createOffer(
                org.id,
                offerDetails.offerName,
                offerDetails.offerDescription,
                offerDetails.offerEffects,
                Number(offerDetails.offerAsk),
                selectedGoals
            );

            console.log('Offer created with ID:', offerId);

            // Immediately fetch updated org data
            const updatedOrgData = await organizationService.getOrgById(org.id);
            console.log('Updated org data:', updatedOrgData);

            if (updatedOrgData.success) {
                setCurrentOrg(updatedOrgData.organization);
                setOfferDetails(initialOfferDetails);
                setSelectedGoals([]);
            } else {
                console.error('Failed to fetch updated org data');
            }
        } catch (error: unknown) {
            console.error("Error creating offer:", error);
            if (error instanceof Error) {
                alert("Failed to create offer: " + error.message);
            } else {
                alert("Failed to create offer");
            }
        }
    };

    useEffect(() => {
        console.log('Current org structure:', JSON.stringify(currentOrg, null, 2));
    }, [currentOrg]);

    useEffect(() => {
        if(org?.players){
        // Shuffle the palette and assign a unique color to each player
        const shuffledPalette = [...palette].sort(() => 0.5 - Math.random());
        const colors = Object.keys(org.players).reduce((acc, playerId, index) => {
            acc[playerId] = shuffledPalette[index % shuffledPalette.length];
            return acc;
        }, {} as Record<string, string>);

        setPlayerColors(colors);
    }
    }, [org?.players]);

    useEffect(() => {
        const fetchData = async () => {
            if (org.currentPhase === "goalAllocation") {
                setIsLoading(true);
                try {
                    const result = await organizationService.fetchGoalAllocationData(org.id, playerId);
                    console.log('Goal allocation data:', result);
                    if (result.data.success) {
                        setGoalAllocationData(result.data.data);
                    }
                } catch (error) {
                    console.error('Error fetching allocation data:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        
        fetchData();
    }, [org.currentPhase, org.id, playerId, currentOrg]);

    const goalCalculations = useGoalAllocationCalculations(goalAllocationData);

    const handleAllocationChange = (goalId: string, offerId: string, amount: number) => {
        setOfferAllocations(prev => ({
            ...prev,
            [offerId]: {
                goalId,
                amount
            }
        }));
    };

    const handleSubmitOfferAllocations = async () => {
        try {
            const response = await offerService.allocateValues(org.id, offerAllocations);
            if (response.success) {
                alert("Offer Allocations submitted successfully!");
                setOfferAllocations({});
                
                // Optionally refresh org data
                const orgData = await organizationService.getOrgById(org.id);
                if (orgData.success) {
                    setCurrentOrg(orgData.organization);
                }
            } else {
                alert("Failed to submit Offer Allocations");
            }
        } catch (error) {
            console.error("Error submitting allocations:", error);
            alert("Error submitting allocations. Please try again.");
        }
    };

    const offerCalculations = useOfferAllocationCalculations(offerAllocationData);

    const handleClaimCompletion = async (offerId: string) => {
        try {
            const response = await completionService.claimCompletion(
                org.id,
                offerId,
                "Completed offer: " + org.offers[offerId]?.name
            );
            
            if (response.success) {
                alert("Completion claimed successfully!");
                // Refresh org data
                const data = await organizationService.getOrgById(org.id);
                if (data.success) {
                    setCurrentOrg(data.organization);
                }
            } else {
                console.error('Failed to claim completion:', response);
                alert("Failed to claim completion");
            }
        } catch (error) {
            console.error("Error claiming completion:", error);
            alert(`Error claiming completion: ${error.message}`);
        }
    };

    const handleChallengeCompletion = async (completionId: string) => {
        try {
            const response = await completionService.challengeCompletion(
                org.id,
                completionId,
                "Challenge: Completion requirements not met"
            );
            
            if (response.success) {
                alert("Challenge submitted successfully!");
                const data = await organizationService.getOrgById(org.id);
                if (data.success) {
                    setCurrentOrg(data.organization);
                }
            } else {
                console.error('Failed to submit challenge:', response);
                alert("Failed to submit challenge");
            }
        } catch (error) {
            console.error("Error submitting challenge:", error);
            alert(`Error submitting challenge: ${error.message}`);
        }
    };

    const handleSupportChallenge = async (completionId: string, support: boolean) => {
        try {
            const response = await completionService.supportChallenge(
                org.id,
                completionId,
                support
            );
            
            if (response.success) {
                alert(`Successfully ${support ? 'supported' : 'opposed'} the challenge!`);
                const data = await organizationService.getOrgById(org.id);
                if (data.success) {
                    setCurrentOrg(data.organization);
                }
            } else {
                console.error('Failed to support/oppose challenge:', response);
                alert("Failed to support/oppose challenge");
            }
        } catch (error) {
            console.error("Error supporting/opposing challenge:", error);
            alert(`Error supporting/opposing challenge: ${error.message}`);
        }
    };

    return (
        <Fragment>
            {org.currentPhase === "goalExpression" && (
                <div className={classes.section}>
                    <Headline level="h4">Propose Goal</Headline>

                    <TextInput
                        value={goalDescription}
                        onChange={(e) => setGoalDescription(e.target.value)}
                        placeholder="Goal Description"
                    />

                    <Button
                        variant="secondary"
                        onClick={handleProposeGoal}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Proposing..." : "Propose Goal"}
                    </Button>
                </div>
            )}

            {org.currentPhase === "goalAllocation" && (
                <div className={classes.section}>
                    {isLoading ? (
                        <p>Loading allocation data...</p>
                    ) : (
                        <>
                            <div className={classes.orgAllocationInfo}>
                                <p>Your Portion of Potential Value to Allocate: {goalCalculations.allocatorPortion}</p>
                                <p>Already Allocated: {goalCalculations.alreadyDistributed}</p>
                                <p>Left to Allocate: {goalCalculations.leftToAllocate}</p>
                            </div>
                            {/* make already allocated and left to allocateuse State to reload based on form inputs */}
                            {/* I should be able to reallocate at will while the phase is open */}
                            {/* Value in the input field should be the value of left to allocated */}
                            {/* These require changes to social-realizer.js, we are currently not tracking who allocates how much to which goal/offer, only that one has distributed points from goals to offers towards them */}

                            <Headline level="h4">Allocate Potential Value to Goals</Headline>
                            <GoalInfo 
                                org={currentOrg} 
                                playerColors={playerColors}
                                onGoalSelect={handleGoalSelect}
                                selectedGoals={selectedGoals}
                                isSelectable={false}
                                playerId={playerId}
                                onAllocateValue={(goalId, value) => {
                                    setGoalAllocations(prev => ({
                                        ...prev,
                                        [goalId]: value
                                    }));
                                }}
                            />
                            <Button onClick={handleSubmitGoalAllocations} disabled={isSubmitting}>
                                Submit Allocations
                            </Button>
                        </>
                    )}
                </div>
            )}

            {org.currentPhase === "offerExpression" && (
                <div className={classes.section}>
                    <Headline level="h4">Make Offer</Headline>

                    <div className={classes.inputGroup}>
                        <TextInput
                            value={offerDetails.offerName}
                            onChange={(e) =>
                                setOfferDetails({
                                    ...offerDetails,
                                    offerName: e.target.value,
                                })
                            }
                            placeholder="Name"
                        />

                        <TextInput
                            value={offerDetails.offerDescription}
                            onChange={(e) =>
                                setOfferDetails({
                                    ...offerDetails,
                                    offerDescription: e.target.value,
                                })
                            }
                            placeholder="Description"
                        />

                        <TextInput
                            value={offerDetails.offerEffects}
                            onChange={(e) =>
                                setOfferDetails({
                                    ...offerDetails,
                                    offerEffects: e.target.value,
                                })
                            }
                            placeholder="Effects"
                        />

                        <NumberInput
                            value={offerDetails.offerAsk}
                            onChange={(e) =>
                                setOfferDetails({
                                    ...offerDetails,
                                    offerAsk: e.target.value,
                                })
                            }
                            placeholder="Ask Amount"
                        />

                        <Headline level="h4">Select Target Goals:</Headline>
                        {currentOrg && (
                            <GoalInfo 
                                org={currentOrg} 
                                playerColors={playerColors}
                                onGoalSelect={handleGoalSelect}
                                selectedGoals={selectedGoals}
                                isSelectable={true}
                                playerId={playerId}
                            />
                        )}
                    </div>

                    <Button onClick={handleMakeOffer}>Make Offer</Button>
                </div>
            )}

            {org.currentPhase === "offerAllocation" && (
                <div>
                    <Headline level="h4">Allocate Value from Goals to Offers towards them</Headline>
                    <GoalOfferMapping 
                        org={org} 
                        playerId={playerId}
                        onAllocationChange={handleAllocationChange}
                    />
                    <Button onClick={handleSubmitOfferAllocations}>Submit Offer Allocations</Button>
                </div>
            )}

            {org.currentPhase === "completions" && (
                <div className={classes.section}>
                    <Headline level="h4">Completions Phase</Headline>
                    
                    {/* Debug information */}
                    {/* <div style={{ fontSize: '12px', color: '#666', marginBottom: '1rem' }}>
                        <p>Current Player ID: {playerId}</p>
                        <p>Completions Data: {JSON.stringify(org.completions || {}, null, 2)}</p>
                    </div> */}

                    {/* List of Offers that can be claimed as complete */}
                    <div className={classes.completionsSection}>
                        <h5>Your Offers</h5>
                        <div className={classes.offersList}>
                            {Object.entries(org.offers || {}).map(([offerId, offer]: [string, any]) => {
                                const isCreator = offer.createdById === playerId;
                                // Check if this offer has a completion in the current cycle
                                const hasCompletion = Object.values(org.completions || {}).some(
                                    (completion: any) => completion.offerId === offerId
                                );
                                
                                /*console.log('Offer check:', {
                                    offerId,
                                    createdById: offer.createdById,
                                    playerId,
                                    isCreator,
                                    hasCompletion,
                                    completions: org.completions
                                });*/

                                if (!isCreator || hasCompletion) return null;

                                return (
                                    <Card key={offerId} className={classes.offerCard}>
                                        <h6>{offer.name}</h6>
                                        <p>{offer.description}</p>
                                        <Button onClick={() => handleClaimCompletion(offerId)}>
                                            Claim Completion
                                        </Button>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* List of Claimed Completions */}
                    <div className={classes.completionsSection}>
                        <h5>Claimed Completions</h5>
                        <div className={classes.completionsList}>
                            {Object.entries(org.completions || {}).map(([completionId, completion]: [string, any]) => {
                                const offer = org.offers[completion.offerId];
                                
                                console.log('Completion:', {
                                    completionId,
                                    completion,
                                    offer,
                                    cycle: org.cycles?.[0]
                                });

                                return (
                                    <Card key={completionId} className={classes.completionCard}>
                                        <h6>{offer?.name || 'Unknown Offer'}</h6>
                                        <div className={`${classes.completionStatus} ${
                                            completion.status === 'rejected' ? classes.statusRejected :
                                            completion.status === 'accepted' ? classes.statusAccepted :
                                            classes.statusPending
                                        }`}>
                                            {completion.status}
                                        </div>
                                        <p>Claimed by: {completion.claimedById}</p>
                                        
                                        {completion.challenges && (
                                            <p>Challenges: {Object.keys(completion.challenges).length}</p>
                                        )}
                                        
                                        {!completion.challenges && completion.claimedById !== playerId && (
                                            <Button 
                                                onClick={() => handleChallengeCompletion(completionId)}
                                                variant="secondary"
                                            >
                                                Challenge Completion
                                            </Button>
                                        )}

                                        {completion.challenges && completion.claimedById !== playerId && (
                                            <div className={classes.challengeActions}>
                                                <Button 
                                                    onClick={() => handleSupportChallenge(completionId, true)}
                                                    disabled={completion.supportVotes?.[playerId] !== undefined}
                                                    variant={completion.supportVotes?.[playerId] === true ? "primary" : "secondary"}
                                                >
                                                    Support Challenge
                                                </Button>
                                                <Button 
                                                    onClick={() => handleSupportChallenge(completionId, false)}
                                                    disabled={completion.supportVotes?.[playerId] !== undefined}
                                                    variant={completion.supportVotes?.[playerId] === false ? "primary" : "secondary"}
                                                >
                                                    Oppose Challenge
                                                </Button>
                                            </div>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
};

export default PhaseActions;
