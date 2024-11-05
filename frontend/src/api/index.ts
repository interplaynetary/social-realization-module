import { authService } from './auth';
import { completionService } from './completions';
import { goalService } from './goals';
import { offerService } from './offers';
import { organizationService } from './organisation';

export * from './auth';
export * from './goals';
export * from './offers';
export * from './completions';
export * from './organisation';

// Export a combined API object
export const api = {
  auth: authService,
  org: organizationService,
  goals: goalService,
  offers: offerService,
  completions: completionService
};