import { PathLike } from "fs";

export type Exporters = { [key: string]: Exporter };

export type Exporter = {
    handler: Console;
    name: string;
    settings: ExporterSettings;
};

export type ExporterSettings = {
    type: ExporterType;
    options: ExporterSettingsOptions;
};

export type ExporterSettingsOptions = {
    stdout?: PathLike | NodeJS.WritableStream;
    stderr?: PathLike | NodeJS.WritableStream;
};

export type ExportersSettings = { [key: string]: ExporterSettings };

export enum ExporterType {
    CONSOLE = "console",
    FILE    = "file"
}