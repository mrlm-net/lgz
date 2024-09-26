import { Console } from 'console';
import { createWriteStream, PathLike } from "fs";

import { Exporters, ExporterSettings, ExportersSettings, ExporterType } from './exporter';
import { EngineDefaults } from './defaults';
import { Severity } from './severity';
import { Message } from './message';
import { Colors } from './colors';

export type EngineSettings = {
    defaultExporter?: boolean;
    colorMode?: EngineColorModes;
    exporters?: ExportersSettings;
};

export type EngineColorModes = "true" | "default" | "false";

export class Engine {

    private _exporters: Exporters = {};

    private _settings: EngineSettings;

    constructor(settings?: EngineSettings) {
        this._settings = { ...EngineDefaults, ...(settings || {}) };
        if (this._settings.defaultExporter !== false) {
            this._setDefaultExporter();
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

    public registerExporter(name: string, exporter: ExporterSettings): void {
        this._registerExporter(name, exporter);
    }

    public unregisterExporter(name: string): void {
        delete this._exporters[name];
    }

    public log(level: Severity, ...message: Message): void {
        for (const name in this._exporters) {;
            this._handleMessage(name, level, ...message);
        }
    }

    private _handleMessage(name: string, level: Severity, ...message: Message): void {
        if (this._exporters[name].settings.type === ExporterType.CONSOLE) {
            this._outputMessage(name, level, this._formatMessage(level, message, true));
            return;    
        }

        this._outputMessage(name, level, this._formatMessage(level, message));
    }

    private _outputMessage(name: string, level: Severity, message: Message[]): void {
        switch (true) {
            case this._isErrorLevel(level):
                this._exporters[name].handler.error(...message);
                break;
            case this._isWarningLevel(level):
                this._exporters[name].handler.warn(...message);
                break;
            case this._isNoticeLevel(level):
                this._exporters[name].handler.info(...message);
                break;
            case this._isInformationalLevel(level):
            case this._isDebugLevel(level):    
            default:
                this._exporters[name].handler.log(...message);
                break;
        }
    }

    private _formatMessage(level: Severity, message: Message[], colorized?: boolean): Message[] {
        message = message.map(this._resolveMessage);

        if (colorized) {
            return this._appllyColorByLevel(level, message);
        }

        return message;
    }

    private _resolveMessage(part: Message): string {
        if (typeof part === 'function') {
            return part() as string;
        }

        return part as string;
    }

    private _appllyColorByLevel(level: Severity, message: Message[]): Message[] {
        const output: Message[] = [];

        switch (true) {
            case this._isErrorLevel(level):
                message.forEach(
                    (part: Message) => this._handleColorMode(output, part, Colors.RED)
                );
                break;
            case this._isWarningLevel(level):
                message.forEach(
                    (part: Message) => this._handleColorMode(output, part, Colors.YELLOW)
                );
                break;
            case this._isNoticeLevel(level):
                message.forEach(
                    (part: Message) => this._handleColorMode(output, part, Colors.CYAN)
                );
                break;
            case this._isInformationalLevel(level):
            case this._isDebugLevel(level):
            default:
                message.forEach(
                    (part: Message) => this._handleColorMode(output, part, Colors.WHITE)
                );
                break;
        }

        return output;
    }

    private _isDebugLevel(level: Severity): boolean {
        return level === Severity.DEBUG;
    }

    private _isInformationalLevel(level: Severity): boolean {
        return level === Severity.INFORMATIONAL;
    }

    private _isNoticeLevel(level: Severity): boolean {
        return level === Severity.NOTICE;
    }

    private _isWarningLevel(level: Severity): boolean {
        return level === Severity.WARNING
    }

    private _isErrorLevel(level: Severity): boolean {
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
                type: ExporterType.CONSOLE,
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
            case ExporterType.FILE:
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
            case ExporterType.CONSOLE:
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
}