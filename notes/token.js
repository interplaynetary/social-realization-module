// let's add assetPrice as a Map, mapping assets to their prices in Tokens
// value of any asset can be determined on a case by case basis.

// Instead of Burning tokens we Archive Card-Money

// When someone mintsWithAsset() they get a cards/tokens according to, and the token value of the asset, the % of issued tokens given to the assets pool.

/* 

1. **Physical-Digital Bridge**: The card system creates a tangible representation of digital tokens, making them more accessible to communities.

2. **Asset Flexibility**: Any measurable contribution or item can be tokenized:
   - Labor/Services (hours, sessions)
   - Goods (loaves, kg, kWh)
   - Community Services (transport, childcare, teaching)


3. **Community Governance**: Each community can:
   - Define their own valuable assets
   - Set their own unit measurements
   - Manage card circulation
   - Track Archived Cards

4. **Status Tracking**: The three-state system (pending, circulating, archived) provides:
   - Better audit trails
   - Controlled circulation
   - Historical record keeping
   - Transparency in token lifecycle

This implementation allows communities to create their own "currency" based on whatever they value, while maintaining the digital backbone for security and governance.
*/

class TokenCard {
    constructor(tokenId, assetType, assetAmount, unitOfAccount, status) {
        this.tokenId = tokenId;
        this.assetType = assetType;
        this.assetAmount = assetAmount;
        this.unitOfAccount = unitOfAccount;
        this.status = status; // 'pending', 'circulating', 'archived'
        this.issueDate = Date.now();
        this.archiveDate = null;
        this.communityId = null;
        this.lastValueUpdate = null;
        this.currentHolder = null;
        this.tokenValue = null;
        this.transferHistory = [];
        this.transactionHistory = [];
    }

    addTransfer(fromHolder, toHolder) {
        this.transferHistory.push({
            from: fromHolder,
            to: toHolder,
            timestamp: Date.now()
        });
    }

    addTransaction(type, details) {
        this.transactionHistory.push({
            type,
            details,
            timestamp: Date.now()
        });
    }
    
    generateASCII() {
        let output = '';
        
        // Card border
        output += '+' + '-'.repeat(50) + '+\n';
        
        // Token ID
        output += '| Token ID: ' + this.tokenId.padEnd(39) + '|\n';
        output += '|' + '-'.repeat(50) + '|\n';
        
        // Asset Info
        output += '| Asset: ' + `${this.assetAmount} ${this.unitOfAccount} of ${this.assetType}`.padEnd(43) + '|\n';
        
        // Value
        output += '| Value: ' + `${this.tokenValue ? this.tokenValue.toFixed(2) : 'N/A'} tokens`.padEnd(43) + '|\n';
        
        // Status
        const statusDisplay = `${this.status.toUpperCase()}`;
        output += '| Status: ' + statusDisplay.padEnd(42) + '|\n';
        
        // Community and Holder
        output += '| Community: ' + (this.communityId || 'N/A').padEnd(39) + '|\n';
        output += '| Holder: ' + (this.currentHolder || 'N/A').padEnd(42) + '|\n';
        
        // Dates
        const issueDateStr = new Date(this.issueDate).toLocaleDateString();
        output += '| Issued: ' + issueDateStr.padEnd(42) + '|\n';
        
        if (this.archiveDate) {
            const archiveDateStr = new Date(this.archiveDate).toLocaleDateString();
            output += '| Archived: ' + archiveDateStr.padEnd(40) + '|\n';
        }
        
        // History
        output += '| Transfers: ' + this.transferHistory.length.toString().padEnd(40) + '|\n';
        output += '| Transactions: ' + this.transactionHistory.length.toString().padEnd(37) + '|\n';
        
        // Bottom border
        output += '+' + '-'.repeat(50) + '+\n';
        
        return output;
    }
}

class Token {
    constructor(ticker) {
        this.ticker = ticker;
        this.totalTokenSupply = 0;
        this.assetPrices = new Map(); // Map to store prices for different assets
        this.assetUnits = new Map();  // Map to store units for different assets
        
        // === COMPOSITE NATURE OF VALUE ===
        this.composition = [
            // Physical Realm: Tangible assets, present value, immediate utility
            {pool: "assets", shareOfIssuedTokens: 50},
            // Social Realm: Community impact, future potential, collective benefit
            {pool: "socialValuesRedemptionForTokensPool", shareOfIssuedTokens: 50}
        ];

        this.assetForTokensRedemptionPool = new Map();
        this.socialValuesRedemptionForTokensPool = 0;

        this.socialValuesRedemptionPool = [
            {
                pool: "org1", 
                shareOfPoolRedeemableByOrg: 30, 
                currentOrgCyclePotentialShareOfRedeemableByOrg: 25, 
                realizedShareOfRedeemableByOrg: 75
            },
            {
                pool: "org2", 
                shareOfPoolRedeemableByOrg: 70, 
                currentOrgCyclePotentialShareOfRedeemableByOrg: 25, 
                realizedShareOfRedeemableByOrg: 75
            },
        ];


        this.redemptionLedger = {
            entries: new Map(), // org => {potentialRedemptions: [], realizedRedemptions: []}
        };

        this.cards = new Map(); // tokenId => TokenCard
        this.cardStatuses = {
            pending: new Set(), // Future: Value about to enter system
            circulating: new Set(), // Present: Active value in system
            archived: new Set()  // Past: Historical value record
        };
        this.cardEvents = [];
        this.communitySettings = new Map();
    }

        // Set price and unit for a specific asset
    setAssetPrice(assetType, price, unitOfAccount) {
        this.assetPrices.set(assetType, price);
        this.assetUnits.set(assetType, unitOfAccount);
    }

        // Get price for a specific asset
    getAssetPrice(assetType) {
        if (!this.assetPrices.has(assetType)) {
            throw new Error(`Price not set for asset type: ${assetType}`);
         }
        return this.assetPrices.get(assetType);
    }

    // Get unit for a specific asset
    getAssetUnit(assetType) {
        if (!this.assetUnits.has(assetType)) {
            throw new Error(`Unit not set for asset type: ${assetType}`);
        }
        return this.assetUnits.get(assetType);
    }


// Calculate tokens to mint based on asset amount and type
calculateTokensToMint(assetType, assetAmount) {
    const assetPrice = this.getAssetPrice(assetType);
    return assetAmount / assetPrice;
}

// Mint tokens with asset and distribute to pools
mintWithAsset(assetType, assetAmount) {
    const tokensToMint = this.calculateTokensToMint(assetType, assetAmount);
    
    // Initialize asset balance in pool if not exists
    if (!this.assetForTokensRedemptionPool.has(assetType)) {
        this.assetForTokensRedemptionPool.set(assetType, 0);
    }

    // Distribute asset to pools according to composition
    this.composition.forEach(({pool, shareOfIssuedTokens}) => {
        const poolAmount = (assetAmount * shareOfIssuedTokens) / 100;
        if (pool === "assets") {
            const currentBalance = this.assetForTokensRedemptionPool.get(assetType);
            this.assetForTokensRedemptionPool.set(assetType, currentBalance + poolAmount);
        } else if (pool === "socialValuesRedemptionForTokensPool") {
            // Convert asset amount to token value for social values pool
            const tokenValue = poolAmount * this.getAssetPrice(assetType);
            this.socialValuesRedemptionForTokensPool += tokenValue;
        }
    });

    this.totalTokenSupply += tokensToMint;
    return tokensToMint;
}

// Get current pool balances
getPoolBalances() {
    const assetPoolBalances = {};
    this.assetForTokensRedemptionPool.forEach((balance, assetType) => {
        assetPoolBalances[assetType] = balance;
    });

    return {
        assetPool: assetPoolBalances,
        socialValuesPool: this.socialValuesRedemptionForTokensPool
    };
}

// Calculate total value in tokens
calculateTotalValue() {
    let totalValue = 0;
    this.assetForTokensRedemptionPool.forEach((balance, assetType) => {
        totalValue += balance * this.getAssetPrice(assetType);
    });
    totalValue += this.socialValuesRedemptionForTokensPool;
    return totalValue;
}

// Get token metrics with multi-asset support
getTokenMetrics() {
    const totalValue = this.calculateTotalValue();
    const assetPoolUtilization = {};
    const assetDetails = {};  // NEW: Include both prices and units
    
    this.assetPrices.forEach((price, assetType) => {
        assetDetails[assetType] = {
            price,
            unit: this.getAssetUnit(assetType)
        };
    });
    
    this.assetForTokensRedemptionPool.forEach((balance, assetType) => {
        const assetValue = balance * this.getAssetPrice(assetType);
        assetPoolUtilization[assetType] = (assetValue / totalValue) * 100;
    });

    const totalRedeemable = this.getTotalRedeemableAmount();
    
    return {
        totalSupply: this.totalTokenSupply,
        assetDetails,  // NEW: Replace assetPrices with assetDetails
        totalValue,
        poolUtilization: {
            assets: assetPoolUtilization,
            socialValues: (this.socialValuesRedemptionForTokensPool / totalValue) * 100
        },
        totalRedeemable,
        redeemableRatio: totalRedeemable / this.totalTokenSupply
    };
}

    // Calculate how many tokens an org can redeem based on their social values
    calculateAmountRedeemableForSocialValues(org) {
        const orgPool = this.socialValuesRedemptionPool.find(p => p.pool === org);
        if (!orgPool) return 0;

        const {
            shareOfPoolRedeemableByOrg,
            currentOrgCyclePotentialShareOfRedeemableByOrg,
            realizedShareOfRedeemableByOrg
        } = orgPool;

        // Calculate potential and realized amounts
        const potentialAmount = (this.socialValuesRedemptionForTokensPool * 
            shareOfPoolRedeemableByOrg / 100) * 
            (currentOrgCyclePotentialShareOfRedeemableByOrg / 100);

        const realizedAmount = (this.socialValuesRedemptionForTokensPool * 
            shareOfPoolRedeemableByOrg / 100) * 
            (realizedShareOfRedeemableByOrg / 100);

        return {
            potential: potentialAmount,
            realized: realizedAmount
        };
    }

    // Record a redemption in the ledger
    recordRedemption(org, amount, type) {
        if (!this.redemptionLedger.entries.has(org)) {
            this.redemptionLedger.entries.set(org, {
                potentialRedemptions: [],
                realizedRedemptions: []
            });
        }

        const orgEntry = this.redemptionLedger.entries.get(org);
        const redemption = {
            amount,
            timestamp: Date.now(),
            status: 'pending'
        };

        if (type === 'potential') {
            orgEntry.potentialRedemptions.push(redemption);
        } else if (type === 'realized') {
            orgEntry.realizedRedemptions.push(redemption);
        }
    }

    // Redeem  organization
    redeemSocialValue(org, amount, type = 'realized') {
        const redeemableAmount = this.calculateAmountRedeemableForSocialValues(org);
        
        if (type === 'realized' && amount <= redeemableAmount.realized) {
            this.recordRedemption(org, amount, 'realized');
            this.socialValuesRedemptionForTokensPool -= amount;
            return true;
        } else if (type === 'potential' && amount <= redeemableAmount.potential) {
            this.recordRedemption(org, amount, 'potential');
            this.socialValuesRedemptionForTokensPool -= amount;
            return true;
        }
        
        return false;
    }

    // Get redemption history for an organization
    getRedemptionHistory(org) {
        return this.redemptionLedger.entries.get(org) || {
            potentialRedemptions: [],
            realizedRedemptions: []
        };
    }

    // Get total redeemable amount across all organizations
    getTotalRedeemableAmount() {
        return this.socialValuesRedemptionPool.reduce((total, org) => {
            const amounts = this.calculateAmountRedeemableForSocialValues(org.pool);
            return total + amounts.potential + amounts.realized;
        }, 0);
    }

    // Get organization stats
    getOrgStats(org) {
        const orgPool = this.socialValuesRedemptionPool.find(p => p.pool === org);
        if (!orgPool) return null;

        const redemptionHistory = this.getRedemptionHistory(org);
        const redeemableAmounts = this.calculateAmountRedeemableForSocialValues(org);

        return {
            ...orgPool,
            totalRedeemedPotential: redemptionHistory.potentialRedemptions
                .reduce((total, red) => total + red.amount, 0),
            totalRedeemedRealized: redemptionHistory.realizedRedemptions
                .reduce((total, red) => total + red.amount, 0),
            currentRedeemable: redeemableAmounts
        };
    }

    // Update organization shares
    updateOrgShares(org, updates) {
        const orgPool = this.socialValuesRedemptionPool.find(p => p.pool === org);
        if (!orgPool) return false;

        Object.assign(orgPool, updates);
        return true;
    }

    // Get redemption stats for a specific time period
    getRedemptionStats(startTime, endTime) {
        const stats = {
            totalRedemptions: 0,
            potentialRedemptions: 0,
            realizedRedemptions: 0,
            byOrg: new Map()
        };

        this.redemptionLedger.entries.forEach((orgData, org) => {
            const orgStats = {
                potential: 0,
                realized: 0
            };

            orgData.potentialRedemptions.forEach(redemption => {
                if (redemption.timestamp >= startTime && redemption.timestamp <= endTime) {
                    orgStats.potential += redemption.amount;
                    stats.potentialRedemptions += redemption.amount;
                }
            });

            orgData.realizedRedemptions.forEach(redemption => {
                if (redemption.timestamp >= startTime && redemption.timestamp <= endTime) {
                    orgStats.realized += redemption.amount;
                    stats.realizedRedemptions += redemption.amount;
                }
            });

            stats.byOrg.set(org, orgStats);
        });

        stats.totalRedemptions = stats.potentialRedemptions + stats.realizedRedemptions;
        return stats;
    }

    // Validate if an organization can make a redemption
    validateRedemption(org, amount, type) {
        const redeemableAmount = this.calculateAmountRedeemableForSocialValues(org);
        
        return {
            isValid: type === 'realized' ? 
                amount <= redeemableAmount.realized : 
                amount <= redeemableAmount.potential,
            maxRedeemable: type === 'realized' ? 
                redeemableAmount.realized : 
                redeemableAmount.potential,
            reason: type === 'realized' ? 
                (amount <= redeemableAmount.realized ? 'valid' : 'Exceeds realized amount') :
                (amount <= redeemableAmount.potential ? 'valid' : 'Exceeds potential amount')
        };
    }

    // Issue physical card representation
    issueCard(assetType, assetAmount, communityId, initialHolder) {
        // Validate community settings
        const validationResult = this.validateCommunityOperation(communityId, 'issueCard', {
            assetType,
            assetAmount
        });
        
        if (!validationResult.isValid) {
            return { success: false, reason: validationResult.reason };
        }

        // Generate unique token ID
        const tokenId = `${this.ticker}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Get unit of account for the asset
        const unitOfAccount = this.getAssetUnit(assetType);
        
        // Create new card
        const card = new TokenCard(tokenId, assetType, assetAmount, unitOfAccount, 'pending');
        card.communityId = communityId;
        card.currentHolder = initialHolder;
        
        // Calculate initial token value
        card.tokenValue = this.calculateTokensToMint(assetType, assetAmount);
        card.lastValueUpdate = Date.now();

        // Store card
        this.cards.set(tokenId, card);
        this.cardStatuses.pending.add(tokenId);
        
        // Record event
        this.recordCardEvent(tokenId, 'issue', {
            assetType,
            assetAmount,
            communityId,
            initialHolder
        });

        return { success: true, tokenId, card };
    }

    // Activate card (move from pending to circulating)
    activateCard(tokenId) {
        const card = this.cards.get(tokenId);
        if (card && card.status === 'pending') {
            card.status = 'circulating';
            this.cardStatuses.pending.delete(tokenId);
            this.cardStatuses.circulating.add(tokenId);
            return true;
        }
        return false;
    }

    // Archive card (instead of burning)
    archiveCard(tokenId) {
        const card = this.cards.get(tokenId);
        if (card && card.status === 'circulating') {
            card.status = 'archived';
            card.archiveDate = Date.now();
            this.cardStatuses.circulating.delete(tokenId);
            this.cardStatuses.archived.add(tokenId);
            return true;
        }
        return false;
    }

    // Get card statistics by community
    getCardStats(communityId) {
        const stats = {
            pending: 0,
            circulating: 0,
            archived: 0,
            assetTypes: new Map()
        };

        this.cards.forEach(card => {
            if (card.communityId === communityId) {
                stats[card.status]++;
                
                // Track asset types
                if (!stats.assetTypes.has(card.assetType)) {
                    stats.assetTypes.set(card.assetType, {
                        total: 0,
                        unit: this.getAssetUnit(card.assetType)
                    });
                }
                stats.assetTypes.get(card.assetType).total += card.assetAmount;
            }
        });

        return stats;
    }

    // Community Management Methods
    setCommunitySettings(communityId, settings) {
        this.communitySettings.set(communityId, {
            allowedAssets: settings.allowedAssets || [],
            cardLimits: settings.cardLimits || {},
            administrators: settings.administrators || [],
            customRules: settings.customRules || {}
        });
    }

    validateCommunityOperation(communityId, operation, details) {
        return {isValid: true}
        const settings = this.communitySettings.get(communityId);
        if (!settings) return { isValid: false, reason: 'Community not configured' };

        switch (operation) {
            case 'issueCard':
                return this.validateCardIssuance(settings, details);
            case 'transfer':
                return this.validateCardTransfer(settings, details);
            default:
                return { isValid: false, reason: 'Unknown operation' };
        }
    }

    // Enhanced Card Management Methods
    transferCard(tokenId, fromHolder, toHolder) {
        const card = this.cards.get(tokenId);
        if (!card || card.status !== 'circulating' || card.currentHolder !== fromHolder) {
            return { success: false, reason: 'Invalid transfer conditions' };
        }

        const validationResult = this.validateCommunityOperation(card.communityId, 'transfer', {
            fromHolder,
            toHolder
        });

        if (!validationResult.isValid) {
            return { success: false, reason: validationResult.reason };
        }

        card.addTransfer(fromHolder, toHolder);
        card.currentHolder = toHolder;

        this.recordCardEvent(tokenId, 'transfer', {
            fromHolder,
            toHolder
        });

        return { success: true };
    }

    // Card Value Management
    updateCardValue(tokenId) {
        const card = this.cards.get(tokenId);
        if (!card) return { success: false, reason: 'Card not found' };

        const newTokenValue = this.calculateTokensToMint(card.assetType, card.assetAmount);
        card.tokenValue = newTokenValue;
        card.lastValueUpdate = Date.now();

        this.recordCardEvent(tokenId, 'valueUpdate', {
            oldValue: card.tokenValue,
            newValue: newTokenValue
        });

        return { success: true, value: newTokenValue };
    }

    // Asset Conversion
    convertCardAsset(tokenId, newAssetType) {
        const card = this.cards.get(tokenId);
        if (!card || card.status !== 'circulating') {
            return { success: false, reason: 'Invalid card status' };
        }

        const currentValue = this.calculateTokensToMint(card.assetType, card.assetAmount);
        const newAssetPrice = this.getAssetPrice(newAssetType);
        const newAmount = (currentValue * newAssetPrice);

        const result = this.issueCard(
            newAssetType,
            newAmount,
            card.communityId,
            card.currentHolder
        );

        if (result.success) {
            this.archiveCard(tokenId);
            this.recordCardEvent(tokenId, 'conversion', {
                oldAsset: card.assetType,
                newAsset: newAssetType,
                newTokenId: result.tokenId
            });
        }

        return result;
    }

    // Batch Operations
    batchIssueCards(cardsToIssue) {
        return cardsToIssue.map(cardDetails => 
            this.issueCard(
                cardDetails.assetType,
                cardDetails.assetAmount,
                cardDetails.communityId,
                cardDetails.initialHolder
            )
        );
    }

    batchActivateCards(tokenIds) {
        return tokenIds.map(tokenId => ({
            tokenId,
            success: this.activateCard(tokenId)
        }));
    }

    // Event Recording
    recordCardEvent(tokenId, eventType, details) {
        const event = {
            tokenId,
            eventType,
            timestamp: Date.now(),
            details
        };
        this.cardEvents.push(event);
        return event;
    }

    // Enhanced Validation
    validateCard(tokenId) {
        const card = this.cards.get(tokenId);
        if (!card) return { isValid: false, reason: 'Card not found' };

        return {
            isValid: true,
            status: card.status,
            assetValue: this.calculateTokensToMint(card.assetType, card.assetAmount),
            lastUpdated: card.lastValueUpdate,
            holder: card.currentHolder,
            transferHistory: card.transferHistory,
            transactionHistory: card.transactionHistory
        };
    }
    displayCard(tokenId) {
        const card = this.cards.get(tokenId);
        if (!card) {
            console.log('Card not found');
            return;
        }
        process.stdout.write(card.generateASCII());
    }

    // Add this to visualize multiple cards
    displayAllCards() {
        if (this.cards.size === 0) {
            console.log('No cards in the system');
            return;
        }
        
        this.cards.forEach((card, tokenId) => {
            process.stdout.write(card.generateASCII());
            console.log(); // Empty line between cards
        });
    }
}



// Usage examples:
const token = new Token("SVT");

// Set prices and units for different assets
token.setAssetPrice("ETH", 2000, "coins");
token.setAssetPrice("BTC", 30000, "coins");
token.setAssetPrice("USDC", 1, "dollars");
token.setAssetPrice("LABOR", 50, "hours");
token.setAssetPrice("WHEAT", 300, "tons");

// Mint tokens with different assets
token.mintWithAsset("ETH", 0.5);   // Mint with 0.5 ETH
token.mintWithAsset("BTC", 0.1);   // Mint with 0.1 BTC
token.mintWithAsset("USDC", 1000); // Mint with 1000 USDC

// Get metrics
console.log(token.getTokenMetrics());

// Get org stats
console.log(token.getOrgStats("org1"));

// Get redemption stats for last 30 days
const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
console.log(token.getRedemptionStats(thirtyDaysAgo, Date.now()));

// Validate before redemption
console.log(token.validateRedemption("org1", 100, "realized"));
console.log(token);

// Example of diverse asset types
const communityAssets = [
    { type: "LABOR", unit: "hours", description: "Community service hours" },
    { type: "BREAD", unit: "loaves", description: "Fresh baked bread" },
    { type: "CHILDCARE", unit: "hours", description: "Childcare service" },
    { type: "PRODUCE", unit: "kg", description: "Local organic produce" },
    { type: "TEACHING", unit: "sessions", description: "Educational sessions" },
    { type: "TRANSPORT", unit: "km", description: "Community transport service" },
    { type: "SOLAR", unit: "kWh", description: "Solar energy credits" }
];

// Usage example
const communityToken = new Token("CMT");
communityAssets.forEach(asset => {
    communityToken.setAssetPrice(asset.type, 1, asset.unit); // 1 token per unit
});

// Issue physical cards for different assets
const breadCard = communityToken.issueCard("BREAD", 10, "loaves", "community1"); // 10 loaves
const laborCard = communityToken.issueCard("LABOR", 5, "hours", "community1"); // 5 hours

communityToken.activateCard(breadCard.tokenId);
communityToken.activateCard(laborCard.tokenId);
communityToken.archiveCard(laborCard.tokenId);

// Display all cards in the system
console.log("All cards in the system:");
communityToken.displayAllCards();