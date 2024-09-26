import { Colorizer } from "./colorizer";
import { Prompter } from "./prompt";
import { Severity } from "./severity";

export type Formatter = ((input?: FormatterInput) => string);

export type FormatterInput = {
    colorizer: Colorizer;
    elapsed: [number, number];  
    prompt: Prompter;
    level: Severity;
    started: [number, number];    
}