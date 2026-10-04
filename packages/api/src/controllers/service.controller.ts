import { serviceService } from "../services/service.service";

export const serviceController = {
  getAll: async () => {
    return serviceService.getAll();
  },

  getByCategorie: async (categorieId: string) => {
    return serviceService.getByCategorie(categorieId);
  },

  create: async (nom: string, description: string | undefined, categorieId: string) => {
    return serviceService.create(nom, description, categorieId);
  },

  update: async (id: string, data: { nom?: string; description?: string | null; categorieId?: string }) => {
    return serviceService.update(id, data);
  },

  delete: async (id: string) => {
    return serviceService.delete(id);
  },
};
