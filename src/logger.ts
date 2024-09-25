import { Severity } from "./severity";

export interface Logger {
    // RFC - 5424 + common handler
    log(level: Severity, ...message: string[]): void;
    emergency(...message: string[]): void;
    alert(...message: string[]): void;
    critical(...message: string[]): void;
    info(...message: string[]): void;
    warning(...message: string[]): void;
    error(...message: string[]): void;
    debug(...message: string[]): void;
}