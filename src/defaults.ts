import { EngineColorMode, EngineSettings } from "./engine";
import { Severity } from "./severity";

export const EngineDefaults: EngineSettings = {
    colorMode: "true" as EngineColorMode,
    defaultExporter: true,
    level: Severity.INFORMATIONAL,
    verbose: true
}