import { healthService } from "../services/health.service";
import { healthView } from "../views/health.view";

export const healthController = {
  check: () => {
    const status = healthService.check();
    return healthView.formatStatus(status);
  },
};