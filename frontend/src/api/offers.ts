import { organizationService } from './organisation';

export const offerService = {
  async createOffer(orgId: string, name: string, description: string, effects: string, ask: number, targetGoalIds: string[]) {
    return organizationService.playerAction('offerToOrg', [
      orgId,
      name,
      description,
      effects,
      ask,
      targetGoalIds
    ]);
  },

  async allocateToOffer(orgId: string, amount: number, fromGoalId: string, toOfferId: string) {
    return organizationService.playerAction('allocateToOfferFromGoalInOrg', [
      orgId,
      amount,
      fromGoalId,
      toOfferId
    ]);
  },

  async allocateValues(orgId: string, offerAllocations: Record<string, { goalId: string , amount: number}>) {
    try {
      await Promise.all(
        Object.entries(offerAllocations).map(async ([offerId, allocation]) => {
          await organizationService.playerAction('allocateToOfferFromGoalInOrg', [
            orgId,
            allocation.amount,
            allocation.goalId,
            offerId
          ]);
        })
      );
      return { success: true };
    } catch (error) {
      console.error('Error allocating values:', error);
      return { success: false, error };
    }
  },

  async acceptOffer(offerId: string) {
    return organizationService.playerAction('acceptOffer', [offerId]);
  },

  async acceptCounterOffer(orgId: string, counterofferId: string, accepted: boolean) {
    return organizationService.playerAction('acceptCounterOffer', [
      orgId,
      counterofferId,
      accepted
    ]);
  },

  async getOfferLeaderboard(dimension = 'potentialValue') {
    return organizationService.playerAction('getOfferLeaderboard', [dimension]);
  }
};