import { CategoryData, DEFAULT_CATEGORIES } from 'echo-shared';
import categoriesJson from '../data/categories.json';

export class WordBank {
  private categories: CategoryData[];

  constructor() {
    // Combine DEFAULT_CATEGORIES from echo-shared and categoriesJson so any edits in either location work immediately!
    const jsonCategories = (categoriesJson as CategoryData[]) || [];
    const mergedMap = new Map<string, CategoryData>();

    // Shared categories take priority
    DEFAULT_CATEGORIES.forEach(c => mergedMap.set(c.id, c));
    jsonCategories.forEach(c => {
      if (!mergedMap.has(c.id)) {
        mergedMap.set(c.id, c);
      }
    });

    this.categories = Array.from(mergedMap.values());
  }

  public getCategories(): CategoryData[] {
    return this.categories;
  }

  public getCategoryById(id: string): CategoryData | undefined {
    return this.categories.find(c => c.id === id);
  }

  public getRandomSelection(preferredCategoryId?: string): { category: CategoryData; secretWord: string } {
    let category: CategoryData;
    
    if (preferredCategoryId) {
      const found = this.getCategoryById(preferredCategoryId);
      category = found || this.categories[Math.floor(Math.random() * this.categories.length)];
    } else {
      category = this.categories[Math.floor(Math.random() * this.categories.length)];
    }

    const secretWord = category.words[Math.floor(Math.random() * category.words.length)];
    return { category, secretWord };
  }
}

export const wordBank = new WordBank();
