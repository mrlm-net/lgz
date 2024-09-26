import { Console } from 'console';
import { createWriteStream, PathLike } from "fs";

import { Exporters, ExporterSettings, ExportersSettings, ExporterTypes } from './exporter';
import { EngineDefaults } from './defaults';
import { Severity } from './severity';
import { Message } from './message';
import { ANSI_REGEX, Colors } from './colors';
import { Colorize } from './colorizer';
import { Logger } from './logger';

export type EngineSettings = {
    defaultExporter?: boolean;
    colorMode?: EngineColorMode;
    exporters?: ExportersSettings;
    level?: Severity;
    verbose?: boolean;
};

export type EngineColorMode = EngineColorModes;

export enum EngineColorModes {
    TRUE    = "true",
    DEFAULT = "default",
    FALSE   = "false"
};

export class Engine implements Logger {

    private _exporters: Exporters = {};

    private _settings: EngineSettings;

    private _timer: [number, number] = process.hrtime();

    constructor(settings?: EngineSettings) {
        this._settings = { ...EngineDefaults, ...(settings || {}) };
        if (this._settings.defaultExporter === true) {
            this._setDefaultExporter();
        }

        if (this._settings.colorMode !== "default") {
            process.env.FORCE_COLOR = "0";
        }
        
        this._registerExporters(this._settings.exporters || {});
    }

    public info(...message: Message): void {
        this.log(Severity.INFORMATIONAL, ...message);
    }

    public debug(...message: Message): void {
        this.log(Severity.DEBUG, ...message);
    }

    public warning(...message: Message): void {
        this.log(Severity.WARNING, ...message);
    }

    public error(...message: Message): void {
        this.log(Severity.ERROR, ...message);
    }

    public critical(...message: Message): void {
        this.log(Severity.CRITICAL, ...message);
    }

    public alert(...message: Message): void {   
        this.log(Severity.ALERT, ...message);
    }

    public emergency(...message: Message): void {
        this.log(Severity.EMERGENCY, ...message);
    }

    public setLevel(level: Severity): void {
        this._settings.level = level;
    }

    public setVerbose(verbose: boolean): void {
        this._settings.verbose = verbose;
    }

    public setColorMode(mode: EngineColorMode): void {
        this._settings.colorMode = mode;
    }

    public registerExporter(name: string, exporter: ExporterSettings): void {
        this._registerExporter(name, exporter);
    }

    public unregisterExporter(name: string): void {
        this._exporters[name] ? delete this._exporters[name] : null;
    }

    public log(level: Severity, ...message: Message): void {
        if (!this._shouldDisplay(level)) {
            return;
        }

        for (const name in this._exporters) {;
            this._handleMessage(name, level, ...message);
        }
    }

    private _handleMessage(name: string, level: Severity, ...message: Message): void {
        if (this._exporters[name].settings.type === ExporterTypes.CONSOLE) {
            this._outputMessage(name, level, this._formatMessage(level, message, true));
            return;    
        }
        this._outputMessage(name, level, this._formatMessage(level, message));
    }

    private _outputMessage(name: string, level: Severity, message: Message[]): void {
        switch (true) {
            case this._isDebugLevelGroup(level):
                if (this._settings.verbose === true) {
                    this._exporters[name].handler.trace(...message);
                    break;
                }
                this._exporters[name].handler.debug(...message);
                break;
            case this._isErrorLevelGroup(level):
                this._exporters[name].handler.error(...message);
                break;
            case this._isWarningLevelGroup(level):
                this._exporters[name].handler.warn(...message);
                break;
            case this._isNoticeLevelGroup(level):
                this._exporters[name].handler.info(...message);
                break;
            case this._isInformationalLevelGroup(level):    
            default:
                this._exporters[name].handler.log(...message);
                break;
        }
    }

    private _formatMessage(level: Severity, message: Message[], colorized?: boolean): Message[] {
        message = message.map(
            (part: Message) => this._resolveMessage(level, part)
        );

        if (colorized === true) {
            return this._appllyColorByLevel(level, message);
        }

        message = message.map(
            (part: Message) => (typeof part === "string") 
                ? (part as string).replace(ANSI_REGEX, "") as Message 
                : part
        );


        return message;
    }

    private _shouldDisplay(level: Severity): boolean {
        return level <= (this._settings.level || Severity.DEBUG);
    }

    private _resolveMessage(level: Severity, part: Message): string {
        if (typeof part === 'function') {
            return part({
                colorizer: Colorize,
                elapsed: this._getElapsedTime(),
                level: level,
                started: this._timer
            }) as string;
        }

        return part as string;
    }

    private _appllyColorByLevel(level: Severity, message: Message[]): Message[] {
        const output: Message[] = [];

        switch (true) {
            case this._isErrorLevelGroup(level):
                message.forEach(
                    (part: Message) => this._handleColorMode(output, part, Colors.RED)
                );
                break;
            case this._isWarningLevelGroup(level):
                message.forEach(
                    (part: Message) => this._handleColorMode(output, part, Colors.YELLOW)
                );
                break;
            case this._isNoticeLevelGroup(level):
                message.forEach(
                    (part: Message) => this._handleColorMode(output, part, Colors.CYAN)
                );
                break;
            case this._isInformationalLevelGroup(level):
            case this._isDebugLevelGroup(level):
            default:
                message.forEach(
                    (part: Message) => this._handleColorMode(output, part, Colors.WHITE)
                );
                break;
        }

        return output;
    }

    private _isDebugLevelGroup(level: Severity): boolean {
        return level === Severity.DEBUG;
    }

    private _isInformationalLevelGroup(level: Severity): boolean {
        return level === Severity.INFORMATIONAL;
    }

    private _isNoticeLevelGroup(level: Severity): boolean {
        return level === Severity.NOTICE;
    }

    private _isWarningLevelGroup(level: Severity): boolean {
        return level === Severity.WARNING
    }

    private _isErrorLevelGroup(level: Severity): boolean {
        return [
            Severity.CRITICAL,
            Severity.ALERT,
            Severity.EMERGENCY,
            Severity.ERROR
        ].includes(level);
    }

    private _handleColorMode(output: Message[], message: Message, color: Colors): Message[] {
        if (this._settings.colorMode === "true") {
            output.push(color);
            output.push(message);
            output.push(Colors.RESET);
        } else {
            output.push(message);
        }

        return output;
    }

    private _setDefaultExporter(): void {
        this._registerExporter(
            "__DEFAULT__", {
                type: ExporterTypes.CONSOLE,
                options: {}
                
            }
        );
    }

    private _registerExporters(exporters: ExportersSettings): void {
        for (const name in exporters) {
            this._registerExporter(name, exporters[name]);
        }
    }

    private _registerExporter(name: string, exporter: ExporterSettings): void {
        switch (exporter.type) {
            case ExporterTypes.FILE:
                this._exporters[name] = {
                    handler: new Console({
                        inspectOptions: { colors: (this._settings.colorMode === "default") ? "auto" : false as any },
                        stdout: createWriteStream(exporter.options.stdout as PathLike), 
                        stderr: (exporter.options.stderr)
                            ? createWriteStream(exporter.options.stderr as PathLike) 
                            : createWriteStream(exporter.options.stdout as PathLike)

                    }),
                    name: name,
                    settings: exporter
                }
                break;
            case ExporterTypes.CONSOLE:
            default:
                this._exporters[name] = {
                    handler: new Console({
                        inspectOptions: { colors: (this._settings.colorMode === "default") ? "auto" : false as any },
                        stdout: exporter.options.stdout ? exporter.options.stdout as NodeJS.WritableStream : process.stdout, 
                        stderr: exporter.options.stderr ? exporter.options.stderr as NodeJS.WritableStream : process.stderr
                    }),
                    name: name,
                    settings: exporter
                };
                break;
        }       
    }

    private _getElapsedTime(): [number, number] {
        return process.hrtime(this._timer);
    }
}