import React, { useState } from "react";
import Card from "../ui/Card/Card"; // Import the Card component
import * as classes from "./GoalOfferMapping.module.css"; // Create a CSS module for styling

type GoalOfferMappingProps = {
    org: any; // The organization data
    currentCycle: string; // Pass the current cycle as a prop
};

const GoalOfferMapping: React.FC<GoalOfferMappingProps> = ({ org, currentCycle }) => {
    const goals = org.goals ? Object.keys(org.goals).map(goalId => org.goals[goalId]) : [];
    const offers = org.offers || {};

    // State to manage input values for offers
    const [offerInputs, setOfferInputs] = useState<{ [key: string]: number }>({});

    const handleInputChange = (offerId: string, value: number) => {
        setOfferInputs(prev => ({
            ...prev,
            [offerId]: value,
        }));
    };

    // Create a mapping of goals to offers
    const goalOfferMap = goals.map(goal => {
        const offersTowardsSelf = goal.orgData[org.id]?.[org.currentCycle]?.offersTowardsSelf || [];
        const relatedOffers = offersTowardsSelf
            .map((offerId: string) => offers[offerId])
            .filter((offer: any) => offer); // Filter out any undefined offers

        return { goal, relatedOffers };
    });

    return (
        <div className={classes.mappingContainer}>
            {goalOfferMap.map(({ goal, relatedOffers }) => (
                <Card key={goal.id} className={classes.goalCard}>
                    <h5 className={classes.goalTitle}>{goal.description}</h5>
                    <p>Potential Value: {goal.potentialValue || 0}</p>
                    <p>Your Share of Potential Value to Allocate</p>
                    <p>Allocated</p>
                    <p>Left to Allocate</p>
                    <div className={classes.offersList}>
                        {relatedOffers.length > 0 ? (
                            <ul>
                                {relatedOffers.map(offer => (
                                    <li key={offer.id}>
                                        <Card className={classes.offerCard}>
                                            <h6 className={classes.offerTitle}>{offer.name}</h6>
                                            <p>{offer.description}</p>
                                            <p>Ask: {offer.orgData[org.id]?.[org.currentCycle]?.ask}</p>
                                            {/* Input field for offer */}
                                            <p>Allocate Potential Value:</p>
                                            <input
                                                type="number"
                                                value={offerInputs[offer.id] || ''}
                                                onChange={(e) => handleInputChange(offer.id, Number(e.target.value))}
                                                placeholder="Enter value"
                                                className={classes.inputField} // Add a class for styling
                                            />
                                        </Card>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No offers available towards this goal.</p>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default GoalOfferMapping; 