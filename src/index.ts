import { Engine } from './engine';
import { ExporterType } from './exporter';
import { Severity } from './severity';

const eng = new Engine({
    defaultExporter: true,
    colorMode: "false",
    exporters: {
        file: {
            type: ExporterType.FILE,
            options: {
                stdout: 'stdout.log',
                stderr: 'stderr.log'
            }
        },
        }
    }
);

eng.log(Severity.EMERGENCY, "Emergency message", "file", eng, "hello");
eng.log(Severity.CRITICAL, "Critical message");
eng.log(Severity.ERROR, "Error message");
eng.log(Severity.WARNING, "Warning message", () => "Hello");
eng.log(Severity.NOTICE, "Notice message");
eng.log(Severity.INFORMATIONAL, "Informational message");
eng.log(Severity.DEBUG, "Debug message");
