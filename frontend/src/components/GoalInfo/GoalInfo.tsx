import Card from "../ui/Card/Card";
import Headline from "../ui/Headline/Headline";
import * as classes from "./GoalInfo.module.css";
import { useState } from "react";
import PlayerAvatar from "../PlayerAvatar/PlayerAvatar";

type GoalInfoProps = {
    org: any;
    playerColors: Record<string, string>; // Accept playerColors as a prop
    onGoalSelect?: (goalId: string) => void;
    selectedGoals?: string[];
    isSelectable?: boolean;
    onAllocateValue?: (goalId: string, value: number) => void;
};

const GoalInfo = ({ 
    org, 
    playerColors, // Destructure playerColors from props
    onGoalSelect, 
    selectedGoals = [], 
    isSelectable = false,
    onAllocateValue 
}: GoalInfoProps) => {
    const [allocatedValues, setAllocatedValues] = useState<Record<string, number>>({});

    const handleValueChange = (goalId: string, value: number) => {
        setAllocatedValues(prev => ({
            ...prev,
            [goalId]: value
        }));
        onAllocateValue?.(goalId, value);
    };

    const validGoals = org?.goals ? Object.keys(org.goals).filter(goalId => {
        const goal = org.goals[goalId];
        return goal && goal.id && goal.description; // Ensure goal has an ID and description
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
            <div className={classes.cards}>
                {validGoals.map((goalId) => {
                    const goal = org.goals[goalId];
                    const isSelected = selectedGoals?.includes(goalId);
                    
                    // Check if createdById exists and is valid
                    const creatorId = goal.createdById;
                    const creatorName = org.players[creatorId]?.name || "Unknown";
                    const creatorColor = playerColors[creatorId] || "#ccc"; // Fallback to default color

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
                            {org.currentPhase !== "goalExpression" && (
                                    <p>Potential Value: {goal.potentialValue || 0}</p>
                                )}
                            <p>Proposed by:</p>
                                <PlayerAvatar
                                    color={creatorColor} // Use the color for the creator
                                    name={creatorName} // Use the name for the creator
                                />
                            </div>

                            {org.currentPhase === "goalAllocation" && (
                                <div className={classes.inputContainer}>
                                    <label htmlFor={`allocate-${goalId}`}>Allocate Value:</label>
                                    <input
                                        type="number"
                                        id={`allocate-${goalId}`}
                                        className={classes.inputField}
                                        value={allocatedValues[goalId] || ''}
                                        onChange={(e) => handleValueChange(goalId, Number(e.target.value))}
                                        placeholder="Enter value"
                                    />
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default GoalInfo;