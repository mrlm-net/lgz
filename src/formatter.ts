import { Colorize, Colorizer } from "./colorizer";
import { Message } from "./message";
import { Severity } from "./severity";

export type Formatter = ((input?: FormatterInput) => string);

export type FormatterInput = {
    colorizer: Colorizer;
    elapsed: [number, number];  
    level: Severity;
    started: [number, number];    
}