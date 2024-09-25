import { Engine, ExporterType } from './engine';
import { Severity } from './severity';

export {
    Engine,
    Severity
}

const eng = new Engine({
    console: {
        type: ExporterType.CONSOLE,
        options: {
            stdout: process.stdout,
            stderr: process.stderr
        }
    },
    file: {
        type: ExporterType.FILE,
        options: {
            stdout: 'stdout.log',
            stderr: 'stderr.log'
        }
    }
});
eng.info('Nečum', 'a makej', () => "ať se ti to líbí");