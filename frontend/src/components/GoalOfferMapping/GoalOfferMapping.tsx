import React, { useState, useEffect } from "react";
import Card from "../ui/Card/Card";
import * as classes from "./GoalOfferMapping.module.css";
import { useOfferAllocationCalculations } from '../../helpers/helpers';
import { organizationService } from '../../api/organisation';

type GoalOfferMappingProps = {
    org: any;
    currentCycle: string;
    playerId: string;
};

function GoalOfferMapping({ org, currentCycle, playerId }: GoalOfferMappingProps) {
    const goals = React.useMemo(() => 
        org.goals ? Object.keys(org.goals).map(goalId => org.goals[goalId]) : []
    , [org.goals]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [offerInputs, setOfferInputs] = useState<{ [key: string]: number }>({});
    const [allocationData, setAllocationData] = useState<{ [goalId: string]: any }>({});
    const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

    // Fetch allocation data for each goal
    useEffect(() => {
        let mounted = true;
        
        const fetchGoalData = async () => {
            setIsLoading(true);
            try {
                const allocationPromises = goals.map(goal => 
                    organizationService.fetchOfferAllocationData(org.id, playerId, goal.id)
                );
                
                const results = await Promise.all(allocationPromises);
                
                if (!mounted) return;

                const newAllocationData = results.reduce((acc, result, index) => {
                    if (result.data.success) {
                        acc[goals[index].id] = result.data.data;
                    }
                    return acc;
                }, {});
                
                setAllocationData(newAllocationData);
                
                if (!selectedGoalId && goals.length > 0) {
                    setSelectedGoalId(goals[0].id);
                }
            } catch (error) {
                console.error('Error fetching allocation data:', error);
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        if (goals.length > 0) {
            fetchGoalData();
        }

        return () => {
            mounted = false;
        };
    }, [org.id, playerId, goals]);

    const goalCalculations = useOfferAllocationCalculations(
        selectedGoalId ? allocationData[selectedGoalId] : null
    );

    const handleInputChange = React.useCallback((offerId: string, value: number) => {
        setOfferInputs(prev => ({
            ...prev,
            [offerId]: value,
        }));
    }, []);

    const handleGoalSelect = React.useCallback((goalId: string) => {
        setSelectedGoalId(goalId);
    }, []);

    return (
        <div className={classes.mappingContainer}>
            {isLoading ? (
                <p>Loading allocation data...</p>
            ) : (
                goals.map(goal => {
                    const isSelected = selectedGoalId === goal.id;
                    
                    return (
                        <Card 
                            key={goal.id} 
                            className={`${classes.goalCard} ${isSelected ? classes.selectedGoal : ''}`}
                            onClick={() => handleGoalSelect(goal.id)}
                        >
                            <h5 className={classes.goalTitle}>{goal.description}</h5>

                            {isSelected && goalCalculations && (
                                <>
                                    <div className={classes.goalAllocationInfo}>
                                        <p>Potential Value: {goal.orgData[org.id]?.[currentCycle]?.potentialValue || 0}</p>
                                        <p>Your Portion to Allocate: {goalCalculations.allocatorPortion}</p>
                                        <p>Allocated: {goalCalculations.alreadyDistributed}</p>
                                        <p>Left to Allocate: {goalCalculations.leftToAllocate}</p>
                                    </div>

                                    <div className={classes.offersList}>
                                        {Object.entries(goalCalculations.offers).length > 0 ? (
                                            <ul>
                                                {Object.entries(goalCalculations.offers).map(([offerId, offer]) => (
                                                    <li key={offerId}>
                                                        <Card className={classes.offerCard}>
                                                            <h6 className={classes.offerTitle}>{offer.name}</h6>
                                                            <p>{offer.description}</p>
                                                            <p>Ask: {offer.ask}</p>
                                                            <p>Current Potential Value: {offer.currentPotentialValue}</p>
                                                            
                                                            <input
                                                                type="number"
                                                                value={offerInputs[offerId] || ''}
                                                                onChange={(e) => handleInputChange(offerId, Number(e.target.value))}
                                                                placeholder="Enter value allocation"
                                                                className={classes.inputField}
                                                                max={goalCalculations.leftToAllocate}
                                                            />
                                                        </Card>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>No offers available towards this goal.</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </Card>
                    );
                })
            )}
        </div>
    );
}

export default React.memo(GoalOfferMapping); 