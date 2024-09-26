import { Severity } from "./severity";

export type Formatter = ((input?: FormatterInput) => string);

export type FormatterInput = {
    elapsed: [number, number];  
    level: Severity; 
}