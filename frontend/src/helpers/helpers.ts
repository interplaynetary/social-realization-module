import { useState, useEffect } from 'react';

import { Org, Orgs } from "../../../sharedTypes";

const getPlayersNameById = (org: Orgs, id: string) => {
    const foundItem = org.find((item: Org) => item.id === id);
    return foundItem ? foundItem.name : "";
};

interface GoalAllocationData {
    orgPotentialValue: number;
    orgDistributedValue: number;
    totalShares: number;
    allocatorShares: number;
    allocatorDistributed: number;
}

const useGoalAllocationCalculations = (allocationData: GoalAllocationData | null) => {
    const [calculations, setCalculations] = useState({
        remainingPotentialValue: 0,
        allocatorPortion: 0,
        alreadyDistributed: 0,
        leftToAllocate: 0
    });

    useEffect(() => {
        // Guard clause for null allocationData
        if (!allocationData) {
            console.log('allocationData is null');
            return;
        }

        console.log('Received allocationData:', allocationData);

        const {
            orgPotentialValue,
            orgDistributedValue,
            totalShares,
            allocatorShares,
            allocatorDistributed
        } = allocationData;

        console.log('Individual values:', {
            orgPotentialValue,
            orgDistributedValue,
            totalShares,
            allocatorShares,
            allocatorDistributed
        });

        const remainingPotentialValue = orgPotentialValue - orgDistributedValue;
        console.log('remainingPotentialValue:', remainingPotentialValue);

        const allocatorPortion = orgPotentialValue * (allocatorShares / totalShares);
        console.log('allocatorPortion calculation:', {
            remainingPotentialValue,
            totalShares,
            allocatorShares,
            result: allocatorPortion
        });

        const leftToAllocate = allocatorPortion - allocatorDistributed;
        console.log('leftToAllocate calculation:', {
            allocatorPortion,
            allocatorDistributed,
            result: leftToAllocate
        });

        setCalculations({
            remainingPotentialValue,
            allocatorPortion,
            alreadyDistributed: allocatorDistributed,
            leftToAllocate
        });

        console.log('Final calculations:', {
            remainingPotentialValue,
            allocatorPortion,
            alreadyDistributed: allocatorDistributed,
            leftToAllocate
        });
    }, [allocationData]);

    return calculations;
};

interface OfferAllocationData {
    goalData: {
        potentialValue: number;
        potentialValueDistributedFromSelf: number;
    };
    allocatorData: {
        shares: number;
        totalShares: number;
        distributedToOffers: number;
    };
    offers: {
        [offerId: string]: {
            name: string;
            description: string;
            ask: number;
            currentPotentialValue: number;
        };
    };
}

const useOfferAllocationCalculations = (allocationData: OfferAllocationData | null) => {
    const [calculations, setCalculations] = useState({
        remainingPotentialValue: 0,
        allocatorPortion: 0,
        alreadyDistributed: 0,
        leftToAllocate: 0,
        offers: {} as {
            [offerId: string]: {
                name: string;
                description: string;
                ask: number;
                currentPotentialValue: number;
            }
        }
    });

    useEffect(() => {
        if (!allocationData) {
            //console.log('allocationData is null');
            return;
        }

        console.log('Received allocationData:', allocationData);

        const {
            goalData,
            allocatorData,
            offers
        } = allocationData;
        
        // Calculate values using the same logic as allocateToOfferFromGoalInOrg
        const remainingPotentialValue = goalData.potentialValue - goalData.potentialValueDistributedFromSelf;
        const allocatorPortion = goalData.potentialValue * (allocatorData.shares / allocatorData.totalShares);
        const alreadyDistributed = allocatorData.distributedToOffers;
        const leftToAllocate = allocatorPortion - alreadyDistributed;

        // Only update if values have changed
        const newCalculations = {
            remainingPotentialValue,
            allocatorPortion,
            alreadyDistributed,
            leftToAllocate,
            offers
        };

        // Deep comparison to prevent unnecessary updates
        if (JSON.stringify(calculations) !== JSON.stringify(newCalculations)) {
            setCalculations(newCalculations);
        }

    }, [allocationData]); // Only depend on allocationData

    return calculations;
};

// Export both hooks
export { getPlayersNameById, useGoalAllocationCalculations, useOfferAllocationCalculations };