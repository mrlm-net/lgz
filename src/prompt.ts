import ReadLine from "readline";

export type PromptSettings = {

};

export interface Prompter {
    ask(question: string): Promise<string>;
}

export class Prompt {
    public static async ask(question: string): Promise<string> {
        return new Promise((resolve) => {
            ReadLine.clearLine(process.stdout, 0);
            const rl = ReadLine.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question(question, (answer: string) => {
                rl.close();
                resolve(answer);
            });
        });
    }
}