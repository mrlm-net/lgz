# @mrlm.net/logz

> This package is now in PRE-RELEASE state, feel free to use it, but expect that API might slightly change!

Simple, lightweight `NODE.js` logging package. The main motivation to create this package was to rid-off few dependencies from my and my companies stacks and also to design interface inspired by [`RFC-5424`](https://datatracker.ietf.org/doc/html/rfc5424). I'm also taking into the consideration integrations with log aggregation tools to provide simple, small, fast package instead on bundle of existing and than writting wrapper above them to be able to use them in your applications...

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [Logger settings](#logger-settings)
- [Exporters](#exporters)
- [Messages](#messages)
- [API reference](#api-reference)
- [Tools](#tools)

## Installation

This package is provided as standard `NPM` module via public registry, so use your favorite dependency manager and install it into your project.

__YARN__

```shell
$ yarn add @mrlm.net/logz
```

__NPM__

```shell
$ npm install --save @mrlm.net/logz
```

## Usage

Package is exporting `Logger` interface via `Engine` class and also subpackages such as `autoloader` and `colorize`, if you'd like to use those components in your project.

### Using Logger interface

__Basic usage__

```typescript
import { Engine } from '@mrlm.net/logz'
// Create instance of Logger interface
const logger = new Engine;
// Log message via the Logger interface
logger.info("Your message")
```

### Using Autoloader

As mentioned above this package is also exproting `autoloader` sub module which creates singleton instance and returns it via module export to your code. This feature gives you the possibility to globaly manage your application logging through single global accessible interface.

```typescript
import Logger from '@mrlm.net/logz/autoloader'
// With autoloader you can directly start using Logger interface
Logger.info("Your message")
```

## Logger settings

Configuration of the `Logger` interface is done via `EngineSettings` type, interface declaring all settings as optional with default fallback placed in `src/defaults.ts`, engine configuration can be passed via `Engine` class constructor.

```typescript
export type EngineSettings = {
    defaultExporter?: boolean;
    colorMode?: EngineColorMode;
    exporters?: ExportersSettings;
    level?: Severity;
    verbose?: boolean;
};
```

| Option | Type | Default | Description |
| :-- | :--: | :--: | :-- |
| __defaultExporter__ | `boolean` | `true` | Whenever the default exporter should be created or not. Default exporter is creating standard console output via `process.stdout` and `process.stderr` streams. |
| __colorMode__ | `EngineColorModes` | `true` | Accepting `true`, `default` and `false` values described by `EngineColorModes` enumeration. If `true` engine is using build-in color handling, if `default` native colors are used and `false` disables colors at all. |
| __exporters__ | `ExportersSettings` | `{} as ExportersSettings` | Exporters to be loaded into the 

### Message severities

```typescript
// As described in RFC - 5424
export enum Severity {
    EMERGENCY = 0,
    ALERT = 1,
    CRITICAL = 2,
    ERROR = 3,
    WARNING = 4,
    NOTICE = 5,
    INFORMATIONAL = 6,
    DEBUG = 7
}
```

## Exporters

Exporters are wrappers above native Node.js `Console` object and represents particular streams where engine should print the message. One message could be printed to multiple exporters based on engine cofiguration. 

Create `Exporter` object is possibe via `exporters` key in `EngineSettings` object as `ExporterSettings` type through the `Logger` constructor or through `registerExporter(name: string, exporter: ExporterSettings)` `Logger` interface API method.

```typescript
// ExporterSettings
export type ExporterSettings = {
    type: ExporterType;
    options: ExporterSettingsOptions;
};
// ExporterSettingsOptions
export type ExporterSettingsOptions = {
    stdout?: PathLike | NodeJS.WritableStream;
    stderr?: PathLike | NodeJS.WritableStream;
};
```

### Example

```typescript
import { Engine } from '@mrlm.net/lgz'
// Create instance of Logger interface 
// and attach another exporter to Logger
const logger = new Engine({
    exporters: {
        file: {
            type: ExporterType.FILE,
            options: {
                stdout: "stdout.log",
                stderr: "stderr.log"
            }
        }
    }
});
// Log message via the Logger interface
logger.info("Your message")
```

> More examples of `Logger` interface usage could be found [here](/docs/examples.md).

## Messages

Message could be repsented by multiple properties which doesn't require `any` specific type to allow user of this library print also objects, lists and other non-string contstructs. Message also could be represented by `Formatter` function type which allows you to do customizaton of the messages by your own, it also accepts `FormatterInput` type with few useful tools.

```typescript
// Message
export type Message = any | Formatter
```

### Formatter

```typescript
// FormatterInput
export type FormatterInput = {
    colorizer: Colorizer;
    elapsed: [number, number];  
    level: Severity;
    started: [number, number];    
}
// Formatter
export type Formatter = ((input?: FormatterInput) => string);
```

#### Formater input

__Colorizer__

> More details about `Colorizer` could be found [here](/docs/colorizer.md).

__Timer__

## API reference

Engine API reference is described by `Logger` interface.

```typescript
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
```

## Tools

### Colorizer

Details about `Colorizer` could be found [here](/docs/colorizer.md).

### Timer

## Contributrion guide

> TBA in version v1.0.0

> Copyright 2024 &copy; Martin Hrášek & WANTED.solutions s.r.o.