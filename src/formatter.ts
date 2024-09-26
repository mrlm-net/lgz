import { Severity } from "./severity";

export type Formatter = (() => string);

export type FormatterInput = {
    elapsed: [number, number];  
    level: Severity; 
}