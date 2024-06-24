export interface ClivoOption {
  label?: string;
  letter?: string;
  name: string;
}

export interface ClivoParams {
  acceptUnspecifiedOptions?: boolean;
  args: string[];
  options: ClivoOption[];
  parseFrom?: number;
}

export type ClivoDictionary = Record<string, string[]>;

export interface ClivoAction {
  action: () => Promise<void>;
  name: string;
}

export interface ClivoChoice {
  label?: string;
  name: string;
}

export type ClivoWorkflowType = "number" | "options" | "text";
export interface ClivoWorkflowStep {
  choices?: ClivoChoice[];
  message: string;
  type: ClivoWorkflowType;
}
