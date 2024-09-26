import { Colors } from "./colors";
import { Message } from "./message";

export interface Colorizer {
    colorize(color: Colors, message: Message): string;
    red(message: Message): string;
    yellow(message: Message): string;
    cyan(message: Message): string;
    white(message: Message): string;
    green(message: Message): string;
    blue(message: Message): string;
    magenta(message: Message): string;
}

export class Colorize {
        
    public static colorize(color: Colors, message: Message): string {
        return `${color}${message}${Colors.RESET}`;
    }
    
    public static red(message: Message): string {
        return `${Colors.RED}${message}${Colors.RESET}`;
    }

    public static yellow(message: Message): string {
        return `${Colors.YELLOW}${message}${Colors.RESET}`;
    }

    public static cyan(message: Message): string {
        return `${Colors.CYAN}${message}${Colors.RESET}`;
    }

    public static white(message: Message): string {
        return `${Colors.WHITE}${message}${Colors.RESET}`;
    }

    public static green(message: Message): string {
        return `${Colors.GREEN}${message}${Colors.RESET}`;
    }

    public static blue(message: Message): string {
        return `${Colors.BLUE}${message}${Colors.RESET}`;
    }

    public static magenta(message: Message): string {
        return `${Colors.MAGENTA}${message}${Colors.RESET}`;
    }

}