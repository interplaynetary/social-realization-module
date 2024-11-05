import { Fragment, useEffect, useState } from "react";
import Button from "../ui/Button/Button";
import Headline from "../ui/Headline/Headline";
import NumberInput from "../ui/NumberInput/NumberInput";
import TextInput from "../ui/TextInput/TextInput";
import * as classes from "./PhaseActions.module.css";
import { goalService, offerService, organizationService } from "../../api";
import { currentOrgAtom } from "../../state/atoms/currentOrgAtom";
import { useRecoilState } from "recoil";

const PhaseActions = ({ org, apiKey, playerId }) => {
    const [goalDescription, setGoalDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [offerDetails, setOfferDetails] = useState({
        offerName: "",
        offerDescription: "",
        offerEffects: "",
        offerAsk: "",
        targetGoals: "",
    });

    const [currentOrg, setCurrentOrg] = useRecoilState(currentOrgAtom);

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
                // update the orgRegistry
            }
        } catch (error) {
            console.error("Failed to propose goal:", error);
            // TODO: Add error notification
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMakeOffer = async () => {
        const data = await offerService.createOffer(
            org.id,
            offerDetails.offerName,
            offerDetails.offerDescription,
            offerDetails.offerEffects,
            Number(offerDetails.offerAsk),
            offerDetails.targetGoals.split(",")
        );

        if (data.success) {
            console.log(data, "offer has been made <3");
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
                    </div>

                    <Button onClick={handleMakeOffer}>Make Offer</Button>
                </div>
            )}

            {/* Add other phase-specific actions here */}
        </Fragment>
    );
};

export default PhaseActions;
