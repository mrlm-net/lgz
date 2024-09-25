
export type Message = (string | MessageFormatter)[];

export type MessageFormatter = (input?: MessageFormatterInput) => string;

export type MessageFormatterInput = {};