import { ExporterSettings } from "./exporter";
import { Message } from "./message";

export interface Logger {
    info(...message: Message): void;
    debug(...message: Message): void;
    warning(...message: Message): void;
    error(...message: Message): void;
    critical(...message: Message): void;
    alert(...message: Message): void;
    registerExporter(name: string, exporter: ExporterSettings): void;
    unregisterExporter(name: string): void;
    log(level: number, ...message: Message): void;
}