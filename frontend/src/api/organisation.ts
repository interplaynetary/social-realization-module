import { api } from './config';
import JSOG from 'jsog';

export const organizationService = {
  async getOrgRegistry() {
    const response = await api.get('/get-org-registry');
    return response.data;
  },

  async getOrgById(orgId: string) {
    const response = await api.get(`/get-org/${orgId}`);
    return response.data;
  },

  async playerAction(actionType: string, actionParams: any[]) {
    const apiKey = localStorage.getItem('apiKey');
    const response = await api.post('/player-action', {
      apiKey,
      actionType,
      actionParams
    });
    return response.data;
  },

  // Organization-specific actions
  async joinOrg(orgId: string) {
    return this.playerAction('joinOrg', [orgId]);
  },

  async issueShares(amount: number) {
    return this.playerAction('issueShares', [amount]);
  },

  async distributeShares(playerId: string, amount: number) {
    return this.playerAction('distributeShares', [playerId, amount]);
  },

  async issuePotential(amount: number) {
    return this.playerAction('issuePotential', [amount]);
  },

  async runPhaseShift() {
    return this.playerAction('runPhaseShift', []);
  },

  async fetchGoalAllocationData(orgId: string, playerId: string) {
    return await api.get(`/get-goal-allocation-data/${orgId}/${playerId}`);
  },

  async fetchOfferAllocationData(orgId: string, playerId: string, goalId: string) {
      return await api.get(`/get-offer-allocation-data/${orgId}/${playerId}/${goalId}`);
  },

  async acceptOffer(offerId: string) {
    return await this.playerAction('acceptOffer', [offerId]);
  },
  
};