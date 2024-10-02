import { Fragment, useState } from "react";
import { PlayerActionType, PlayerActionTypes } from "../../../../sharedTypes";
import { executePlayerAction } from "../../api/api";
import Button from "../ui/Button/Button";
import Headline from "../ui/Headline/Headline";
import NumberInput from "../ui/NumberInput/NumberInput";
import TextInput from "../ui/TextInput/TextInput";
import * as classes from "./PhaseActions.module.css";

const PhaseActions = ({ org, apiKey, playerId }) => {
    const [goalDescription, setGoalDescription] = useState("");
    const [offerDetails, setOfferDetails] = useState({
        offerName: "",
        offerDescription: "",
        offerEffects: "",
        offerAsk: "",
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

        const data = await executePlayerAction(
            apiKey,
            PlayerActionTypes.ProposeGoalToOrg,
            [org.id, goalDescription]
        );

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
        <Fragment>
            {org.currentPhase === "goalExpression" && (
                <div className={classes.section}>
                    <Headline level="h4">Propose Goal</Headline>

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
                <div className={classes.section}>
                    <Headline level="h4">Make Offer</Headline>

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
                    <NumberInput
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
        </Fragment>
    );
};

export default PhaseActions;
