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
        switch (level) {
            default:
                this._exporters[name].handler.log(...message);
        }
    }

    private _formatMessage(level: Severity, message: Message[], colorized?: boolean): Message[] {
        message = message.map((part: Message) => {
            if (typeof part === 'function') {
                part = part();
            }

            return part;
        });

        if (colorized) {
            return this._appllyColorByLevel(level, message);
        }

        return message;
    }

    private _appllyColorByLevel(level: Severity, message: Message[]): Message[] {
        const output: Message[] = [];
        switch (level) {
            case Severity.CRITICAL:
            case Severity.ALERT:
            case Severity.EMERGENCY:
            case Severity.ERROR:
                message.forEach((part: Message) => {
                    if (this._settings.colorMode === "true") {
                        output.push(Colors.RED);
                        output.push(part);
                        output.push(Colors.RESET);
                    } else {
                        output.push(part);
                    }
                });
                break;
            case Severity.WARNING:
                message.forEach((part: Message) => {
                    if (this._settings.colorMode === "true") {
                        output.push(Colors.YELLOW);
                        output.push(part);
                        output.push(Colors.RESET);
                    } else {
                        output.push(part);
                    }
                });
                break;
            case Severity.NOTICE:
                message.forEach((part: Message) => {
                    if (this._settings.colorMode === "true") {
                        output.push(Colors.CYAN);
                        output.push(part);
                        output.push(Colors.RESET);
                    } else {
                        output.push(part);
                    }
                });
                break;
            case Severity.INFORMATIONAL:
            case Severity.DEBUG:
            default:
                message.forEach((part: Message) => {
                    if (this._settings.colorMode === "true") {
                        output.push(Colors.BLUE);
                        output.push(part);
                        output.push(Colors.RESET);
                    } else {
                        output.push(part);
                    }
                });
                break;
        }

        return output;
        
    }

    private _setDefaultExporter(): void {
        this._registerExporter(
            "__DEFAULT__", {
                type: ExporterType.CONSOLE,
                options: {
                    stdout: process.stdout, 
                    stderr: process.stderr
                }
                
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