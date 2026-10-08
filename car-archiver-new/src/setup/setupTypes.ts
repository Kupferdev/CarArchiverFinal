import type { AppConfig } from "../shared/types/appConfig";

export interface SetupWizardData extends Omit<AppConfig, "onboardingCompleted"> {
  isNewUser?: boolean;
}

export type SetupDataUpdater = (data: Partial<SetupWizardData>) => void;
