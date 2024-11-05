import { organizationService } from './organisation';

export const completionService = {
  async claimCompletion(orgId: string, offerId: string, claimDescription: string) {
    return organizationService.playerAction('claimCompletion', [
      orgId,
      offerId,
      claimDescription
    ]);
  },

  async challengeCompletion(orgId: string, completionId: string, challengeDescription: string) {
    return organizationService.playerAction('challengeCompletion', [
      orgId,
      completionId,
      challengeDescription
    ]);
  },

  async supportChallenge(orgId: string, completionId: string, support: boolean) {
    return organizationService.playerAction('supportChallenge', [
      orgId,
      completionId,
      support
    ]);
  }
};