import { UserPortfolio } from '@/utils/types';
import { create } from 'zustand';
// import { UserPortfolio, SkillRating } from '@/lib/types';

interface PortfolioStore {
  currentPortfolio: UserPortfolio | null;
  setCurrentPortfolio: (portfolio: UserPortfolio) => void;
  updateSkillRating: (userId: string, skill: string, rating: number, raterId: string) => void;
  clearPortfolio: () => void;
}

export const usePortfolioStore = create<PortfolioStore>((set) => ({
  currentPortfolio: null,
  setCurrentPortfolio: (portfolio) => set({ currentPortfolio: portfolio }),
  updateSkillRating: (userId, skill, rating, raterId) => 
    set((state) => {
      if (!state.currentPortfolio || state.currentPortfolio.id !== userId) {
        return state;
      }

      const skillRatings = state.currentPortfolio.skillRatings || [];
      const existingRatingIndex = skillRatings.findIndex(sr => sr.skill === skill);
      
      if (existingRatingIndex >= 0) {
        // Update existing rating
        const existingRating = skillRatings[existingRatingIndex];
        const newRaterIds = existingRating.raterIds.includes(raterId) 
          ? existingRating.raterIds 
          : [...existingRating.raterIds, raterId];
        
        const newAverageRating = (existingRating.averageRating * existingRating.raterIds.length + rating) / newRaterIds.length;
        
        skillRatings[existingRatingIndex] = {
          ...existingRating,
          rating,
          raterIds: newRaterIds,
          averageRating: newAverageRating
        };
      } else {
        // Add new rating
        skillRatings.push({
          skill,
          rating,
          raterIds: [raterId],
          averageRating: rating
        });
      }

      return {
        currentPortfolio: {
          ...state.currentPortfolio,
          skillRatings
        }
      };
    }),
  clearPortfolio: () => set({ currentPortfolio: null })
}));