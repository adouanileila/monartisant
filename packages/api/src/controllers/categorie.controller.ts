import { categorieService } from "../services/categorie.service";

export const categorieController = {
  getAll: async () => {
    return categorieService.getAll();
  },
  create: async (nom: string) => {
    return categorieService.create(nom);
  },
  delete: async (id: string) => {
    return categorieService.delete(id);
  },
};