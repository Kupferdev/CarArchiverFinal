import { app } from "electron"
import fs from "fs"
import path from "path"

const configPath = path.join(app.getPath("userData"), "app-config.json")

export type AppConfig = {
  onboardingCompleted: boolean
  language: string
  dataDir: string
  eulaAccepted: boolean
}

export function getConfig(): AppConfig | null {
  if (!fs.existsSync(configPath)) return null

  const raw = fs.readFileSync(configPath, "utf-8")
  return JSON.parse(raw)
}

export function saveConfig(config: AppConfig) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
}