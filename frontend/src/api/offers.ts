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