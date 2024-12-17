import Card from "../ui/Card/Card";
import Headline from "../ui/Headline/Headline";
import * as classes from "./OfferInfo.module.css";
import { useState } from "react";
import PlayerAvatar from "../PlayerAvatar/PlayerAvatar";

type OfferInfoProps = {
    org: any;
    playerColors: Record<string, string>;
    onOfferSelect?: (offerId: string) => void;
    selectedOffers?: string[];
    isSelectable?: boolean;
};

const OfferInfo = ({ 
    org, 
    playerColors,
    onOfferSelect, 
    selectedOffers = [], 
    isSelectable = false 
}: OfferInfoProps) => {
    const validOffers = org?.offers ? Object.keys(org.offers).filter(offerId => {
        const offer = org.offers[offerId];
        return offer && offer.id && offer.description;
    }) : [];

    if (validOffers.length === 0) {
        return (
            <div className={classes.section}>
                <Headline level="h4">Offers</Headline>
                <p>No offers available.</p>
            </div>
        );
    }

    return (
        <div className={classes.section}>
            <div className={classes.cards}>
                {validOffers.map((offerId) => {
                    const offer = org.offers[offerId];
                    const isSelected = selectedOffers.includes(offerId);
                    
                    const creatorId = offer.createdById;
                    const creatorName = org.players[creatorId]?.name || "Unknown";
                    const creatorColor = playerColors[creatorId] || "#ccc";

                    return (
                        <Card 
                            key={offerId} 
                            className={`${classes.offerCard} ${isSelected ? classes.selected : ''}`}
                            data-offer-id={offerId}
                            id={`offer-${offerId}`}
                            onClick={() => isSelectable && onOfferSelect?.(offerId)}
                            style={{ cursor: isSelectable ? 'pointer' : 'default' }}
                        >
                            <h5 className={classes.offerTitle}>
                                {offer.description}
                            </h5>
                            <div className={classes.offerDetails}>
                                <p>Ask Amount: {offer.orgData[org.id]?.[org.currentCycle]?.ask}</p>
                                <p>Offered by:</p>
                                <PlayerAvatar
                                    color={creatorColor}
                                    name={creatorName}
                                />
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default OfferInfo;