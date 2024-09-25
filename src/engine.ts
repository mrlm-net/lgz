import { Console } from 'console';
import { createWriteStream, PathLike } from 'fs';

import { Logger } from './logger';
import { Severity } from './severity';
import { Message } from './message';

export type Exporter = Console;
export type Exporters = { [key: string]: Exporter };

export enum ExporterType {
    CONSOLE = 'console',
    FILE = 'file'
}

export type ExportersConfig = { [key: string]: ExporterConfig };

export type ExporterConfig = {
    type: ExporterType;
    options?: ExporterOptions;
};

export type ExporterConsoleOptions = {
    stdout?: NodeJS.WritableStream;
    stderr?: NodeJS.WritableStream;
}

export type ExporterFileOptions = {
    stdout: string;
    stderr?: string;
}

export type ExporterOptions = ExporterConsoleOptions | ExporterFileOptions;

export class Engine implements Logger {

    private _exporters: { [key: string]: Console } = {
        __DEFAULT__: new Console(process.stdout, process.stderr),  
    };

    private _timer: [number, number] = process.hrtime();

    constructor(exporters: ExportersConfig = {}) {
        this._registerExporters(exporters);
    }

    public log(level: Severity, ...message: Message): void {
        this._exportMessage(level, ...message);
    }

    public emergency(...message: Message): void {
        this._exportMessage(Severity.EMERGENCY, ...message);
    }

    public alert(...message: Message): void {
        this._exportMessage(Severity.ALERT, ...message);
    }

    public critical(...message: Message): void {
        this._exportMessage(Severity.CRITICAL, ...message);
    }

    public info(...message: Message): void {
        this._exportMessage(Severity.INFORMATIONAL, ...message);
    }

    public warning(...message: Message): void {
        this._exportMessage(Severity.WARNING, ...message);
    }

    public error(...message: Message): void {
        this._exportMessage(Severity.ERROR, ...message);
    }

    public debug(...message: Message): void {
        this._exportMessage(Severity.DEBUG, ...message);
    }

    private _registerExporters(exporters: ExportersConfig): void {
        Object.entries(exporters).forEach(
            ([key, exporter]) => {
                this._registerExporter(key, exporter);
            }
        );
    }

    private _registerExporter(name: string, exporter: ExporterConfig): void {
        this._exporters[name] = this._createExporter(exporter);
    }

    private _unregisterExporter(name: string): void {
        delete this._exporters[name];
    }

    private _createExporter(exporter: ExporterConfig): Exporter {
        if (exporter.type === ExporterType.CONSOLE) {
            return new Console(process.stdout, process.stderr);
        }
        return new Console(
            createWriteStream(exporter.options?.stdout as PathLike), 
            createWriteStream(
                exporter.options?.stderr 
                    ? exporter.options?.stderr as PathLike 
                    : exporter.options?.stdout as PathLike
            )
        );
    }

    private _exportMessage(level: Severity, ...message: Message): void {
        Object.entries(this._exporters).forEach(([key, exporter]) => {
            switch (level) {
                case Severity.EMERGENCY:
                    exporter.trace(
                        this._formatMessage(level, ...message)
                    );
                    break;
                case Severity.ALERT:
                    exporter.trace(
                        this._formatMessage(level, ...message)
                    );
                    break;
                case Severity.CRITICAL:
                    exporter.trace(
                        this._formatMessage(level, ...message)
                    );
                    break;
                case Severity.ERROR:
                    exporter.error(
                        this._formatMessage(level, ...message)
                    );
                    break;
                case Severity.WARNING:
                    exporter.warn(
                        this._formatMessage(level, ...message)
                    );
                    break;
                case Severity.NOTICE:
                    exporter.info(
                        this._formatMessage(level, ...message)
                    );
                    break;
                case Severity.INFORMATIONAL:
                    exporter.info(
                        this._formatMessage(level, ...message)
                    );
                    break;
                case Severity.DEBUG:
                    exporter.debug(
                        this._formatMessage(level, ...message)
                    );
                    break;
                default:
                    exporter.log(
                        this._formatMessage(level, ...message)
                    );
                    break;
            }  
        });
    }

    private _formatMessage(level: Severity, ...message: Message): string {
        const [seconds, nanoseconds] = process.hrtime(this._timer);

        const messageOutput = message.map((part, index) => {
            console.log(typeof part, index);

            if (typeof part === 'function') {
                return part({
                    level,
                    time: {
                        seconds,
                        nanoseconds
                    }
                });
            }

            return part;
        });


        return `[${seconds}.${nanoseconds}] ${Severity[level].toUpperCase()}: ${messageOutput.join(' ')}`;
    }
}

export default Engine;