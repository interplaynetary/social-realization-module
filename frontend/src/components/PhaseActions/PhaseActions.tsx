import { Fragment, useEffect, useState } from "react";
import Button from "../ui/Button/Button";
import Headline from "../ui/Headline/Headline";
import NumberInput from "../ui/NumberInput/NumberInput";
import TextInput from "../ui/TextInput/TextInput";
import * as classes from "./PhaseActions.module.css";
import { goalService, offerService, organizationService } from "../../api";
import { currentOrgAtom } from "../../state/atoms/currentOrgAtom";
import { useRecoilState } from "recoil";
import GoalInfo from "../GoalInfo/GoalInfo";
import { palette } from "../PlayerInfo/PlayerInfoColorPalette"; // Assuming you have a color palette
import GoalOfferMapping from "../GoalOfferMapping/GoalOfferMapping";
import { useGoalAllocationCalculations } from '../../helpers/helpers';


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
    const [allocations, setAllocations] = useState<Record<string, number>>({});
    const [playerColors, setPlayerColors] = useState<Record<string, string>>({});
    const [allocationData, setAllocationData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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

    const handleSubmitAllocations = async () => {
        try {
            const response = await goalService.allocateValues(org.id, allocations);
            if (response.success) {
                alert("Allocations submitted successfully!");
                setAllocations({});
            } else {
                alert("Failed to submit allocations");
            }
        } catch (error) {
            console.error("Error submitting allocations:", error);
            alert("An error occurred while submitting allocations.");
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
                        setAllocationData(result.data.data);
                    }
                } catch (error) {
                    console.error('Error fetching allocation data:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        
        fetchData();
    }, [org.currentPhase, org.id, playerId]);

    const calculations = useGoalAllocationCalculations(allocationData);

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
                                <p>Your Portion of Potential Value to Allocate: {calculations.allocatorPortion}</p>
                                <p>Already Allocated: {calculations.alreadyDistributed}</p>
                                <p>Left to Allocate: {calculations.leftToAllocate}</p>
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
                                onAllocateValue={(goalId, value) => {
                                    setAllocations(prev => ({
                                        ...prev,
                                        [goalId]: value
                                    }));
                                }}
                            />
                            <Button onClick={handleSubmitAllocations} disabled={isSubmitting}>
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
                            />
                        )}
                    </div>

                    <Button onClick={handleMakeOffer}>Make Offer</Button>
                </div>
            )}

            {org.currentPhase === "offerAllocation" && (
                <div>
                    <Headline level="h4">Allocate Value from Goals to Offers towards them</Headline>
                    <GoalOfferMapping org={org} currentCycle={org.currentCycle} playerId={playerId}/>
                </div>
            )}
        </Fragment>
    );
};

export default PhaseActions;
