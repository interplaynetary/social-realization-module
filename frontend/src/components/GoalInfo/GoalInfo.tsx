import { useState, useEffect } from "react";
import Card from "../ui/Card/Card";
import * as classes from "./GoalInfo.module.css";
import PlayerAvatar from "../PlayerAvatar/PlayerAvatar";
import { organizationService } from "../../api/organisation";

type GoalInfoProps = {
    org: any;
    playerColors: Record<string, string>;
    onGoalSelect?: (goalId: string) => void;
    selectedGoals?: string[];
    isSelectable?: boolean;
    onAllocateValue?: (goalId: string, value: number) => void;
    playerId: string; // Add playerId prop
};

const GoalInfo = ({ 
    org, 
    playerColors,
    onGoalSelect, 
    selectedGoals = [], 
    isSelectable = false,
    onAllocateValue,
    playerId
}: GoalInfoProps) => {
    const [allocatedValues, setAllocatedValues] = useState<Record<string, number>>({});
    const [goalAllocations, setGoalAllocations] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Fetch allocation data for each goal
    useEffect(() => {
        let mounted = true;
        
        const fetchGoalData = async () => {
            setIsLoading(true);
            try {
                const validGoals = org?.goals ? Object.keys(org.goals).filter(goalId => {
                    const goal = org.goals[goalId];
                    return goal && goal.id && goal.description;
                }) : [];

                const allocationPromises = validGoals.map(goalId => 
                    organizationService.fetchOfferAllocationData(org.id, playerId, goalId)
                );
                
                const results = await Promise.all(allocationPromises);
                
                if (!mounted) return;

                const newAllocations = results.reduce((acc, result, index) => {
                    if (result.data.success) {
                        acc[validGoals[index]] = result.data.data;
                    }
                    return acc;
                }, {});
                
                setGoalAllocations(newAllocations);
            } catch (error) {
                console.error('Error fetching goal allocation data:', error);
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        if (org?.id && playerId) {
            fetchGoalData();
        }

        return () => {
            mounted = false;
        };
    }, [org?.id, playerId, org?.goals]);

    const handleValueChange = (goalId: string, value: number) => {
        setAllocatedValues(prev => ({
            ...prev,
            [goalId]: value
        }));
        onAllocateValue?.(goalId, value);
    };

    const validGoals = org?.goals ? Object.keys(org.goals).filter(goalId => {
        const goal = org.goals[goalId];
        return goal && goal.id && goal.description;
    }) : [];

    if (validGoals.length === 0) {
        return (
            <div className={classes.section}>
                <p>No goals available.</p>
            </div>
        );
    }

    return (
        <div className={classes.section}>
            {isLoading ? (
                <p>Loading goal data...</p>
            ) : (
                <div className={classes.cards}>
                    {validGoals.map((goalId) => {
                        const goal = org.goals[goalId];
                        const isSelected = selectedGoals?.includes(goalId);
                        const goalAllocation = goalAllocations[goalId];
                        
                        const creatorId = goal.createdById;
                        const creatorName = org.players[creatorId]?.name || "Unknown";
                        const creatorColor = playerColors[creatorId] || "#ccc";

                        return (
                            <Card 
                                key={goalId} 
                                className={`${classes.goalCard} ${isSelected ? classes.selected : ''}`}
                                data-goal-id={goalId}
                                id={`goal-${goalId}`}
                                onClick={() => isSelectable && onGoalSelect?.(goalId)}
                                style={{ cursor: isSelectable ? 'pointer' : 'default' }}
                            >
                                <h5 className={classes.goalTitle}>
                                    {goal.description}
                                </h5>
                                <div className={classes.goalDetails}>
                                    {goalAllocation && (
                                        <div className={classes.allocationInfo}>
                                            <p>Potential Value: {goalAllocation.goalData.potentialValue}</p>
                                        </div>
                                    )}
                                    <p>Proposed by:</p>
                                    <PlayerAvatar
                                        color={creatorColor}
                                        name={creatorName}
                                    />
                                </div>

                                {org.currentPhase === "goalAllocation" && (
                                    <div className={classes.inputContainer}>
                                        <input
                                            type="number"
                                            id={`allocate-${goalId}`}
                                            className={classes.inputField}
                                            value={allocatedValues[goalId] || ''}
                                            onChange={(e) => handleValueChange(goalId, Number(e.target.value))}
                                            placeholder="Enter value allocation"
                                        />
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default GoalInfo;