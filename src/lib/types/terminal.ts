export interface CommandOutput {
	command: string;
	output: string[];
}

export interface Command {
	description: string;
	execute: () => string[];
}

export type CommandMap = Record<string, Command>;
