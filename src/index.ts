import { Engine, EngineColorModes } from './engine';
import { ExporterTypes } from './exporter';
import { FormatterInput } from './formatter';
import { Severity } from './severity';

const eng = new Engine({
    defaultExporter: true,
    colorMode: EngineColorModes.TRUE,
    exporters: {
        file: {
            type: ExporterTypes.FILE,
            options: {
                stdout: 'stdout.log',
                stderr: 'stderr.log'
            }
        },
    },
    verbose: true
});

eng.log(Severity.EMERGENCY, "Emergency message", "file", eng, "hello");
eng.log(Severity.CRITICAL, "Critical message");
eng.log(Severity.ERROR, "Error message");
eng.log(Severity.WARNING, "Warning message");
eng.log(Severity.NOTICE, "Notice message");
eng.log(Severity.INFORMATIONAL, "Informational message");
eng.log(Severity.DEBUG, "Debug message");

eng.info((n: FormatterInput) => {
    const answer = n.prompt.ask("What is your name?");

    console.log("Answer: ", answer);

    return `Elapsed time: ${n.colorizer.green(n.elapsed[0])}.${n.elapsed[1]} seconds - ${answer}`;
});
