import { app } from "electron";
import fs from "fs";
import path from "path";
import type { AppConfig } from "../../../shared/types/appConfig";

const CONFIG_FILE_NAME = "config.json";

function getConfigPath(): string {
  return path.join(app.getPath("userData"), CONFIG_FILE_NAME);
}

export function getConfig(): AppConfig | null {
  const configPath = getConfigPath();

  if (!fs.existsSync(configPath)) return null;

  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<AppConfig>;

    if (!parsed.language || !parsed.savePath || parsed.eulaAccepted !== true) {
      return null;
    }

    const normalizedDbPath = path.normalize(path.resolve(parsed.savePath));
    if (path.basename(normalizedDbPath) !== "data_carArchiver.sqlite" || !fs.existsSync(normalizedDbPath) || !fs.statSync(normalizedDbPath).isFile()) {
      return null;
    }

    return {
      language: parsed.language,
      savePath: normalizedDbPath,
      eulaAccepted: parsed.eulaAccepted,
      theme: parsed.theme === "dark" ? "dark" : "light",
      onboardingCompleted: parsed.onboardingCompleted ?? true,
    };
  } catch (error) {
    console.error("🆘 Config could not be read:", error);
    return null;
  }
}

export function saveConfig(config: AppConfig): void {
  const configPath = getConfigPath();
  const directory = path.dirname(configPath);

  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}

export function hasConfig(): boolean {
  return getConfig() !== null;
}
