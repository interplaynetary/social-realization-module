import { useState } from "react";
import Button from "./ui/Button/Button";
import TextInput from "./ui/TextInput/TextInput";

const PhaseActions = ({ org, apiKey, playerId }) => {
    const [goalDescription, setGoalDescription] = useState("");
    const [offerDetails, setOfferDetails] = useState({
        offerName: "",
        offerDescription: "",
        offerEffects: "",
        offerAsk: "",
        targetGoals: "",
    });

    const handleProposeGoal = async () => {
        const response = await fetch("http://localhost:3000/player-action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                apiKey,
                actionType: "proposeGoalToOrg",
                actionParams: [org.id, goalDescription],
            }),
        });
        const data = await response.json();

        if (data.success) {
            // Handle success
        }
    };

    const handleMakeOffer = async () => {
        const response = await fetch("http://localhost:3000/player-action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                apiKey,
                actionType: "offerToOrg",
                actionParams: [
                    org.id,
                    offerDetails.offerName,
                    offerDetails.offerDescription,
                    offerDetails.offerEffects,
                    offerDetails.offerAsk,
                    offerDetails.targetGoals.split(","),
                ],
            }),
        });

        const data = await response.json();

        if (data.success) {
            // Handle success
        }
    };

    return (
        <div>
            {org.currentPhase === "goalExpression" && (
                <div>
                    <h3>Propose Goal</h3>

                    <TextInput
                        value={goalDescription}
                        onChange={(e) => setGoalDescription(e.target.value)}
                        placeholder="Goal Description"
                    />

                    <Button variant="secondary" onClick={handleProposeGoal}>
                        Propose Goal
                    </Button>
                </div>
            )}

            {org.currentPhase === "offerExpression" && (
                <div>
                    <h3>Make Offer</h3>

                    <TextInput
                        value={offerDetails.offerName}
                        onChange={(e) =>
                            setOfferDetails({
                                ...offerDetails,
                                offerName: e.target.value,
                            })
                        }
                        placeholder="Offer Name"
                    />

                    <TextInput
                        value={offerDetails.offerDescription}
                        onChange={(e) =>
                            setOfferDetails({
                                ...offerDetails,
                                offerDescription: e.target.value,
                            })
                        }
                        placeholder="Offer Description"
                    />

                    <TextInput
                        type="text"
                        value={offerDetails.offerEffects}
                        onChange={(e) =>
                            setOfferDetails({
                                ...offerDetails,
                                offerEffects: e.target.value,
                            })
                        }
                        placeholder="Offer Effects"
                    />

                    {/* TODO: check to create number input? */}
                    <TextInput
                        type="number"
                        value={offerDetails.offerAsk}
                        onChange={(e) =>
                            setOfferDetails({
                                ...offerDetails,
                                offerAsk: e.target.value,
                            })
                        }
                        placeholder="Offer Ask Amount"
                    />

                    <TextInput
                        value={offerDetails.targetGoals}
                        onChange={(e) =>
                            setOfferDetails({
                                ...offerDetails,
                                targetGoals: e.target.value,
                            })
                        }
                        placeholder="Target Goal IDs (comma-separated)"
                    />
                    <Button onClick={handleMakeOffer}>Make Offer</Button>
                </div>
            )}

            {/* Add other phase-specific actions here */}
        </div>
    );
};

export default PhaseActions;
