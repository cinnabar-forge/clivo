import readline from "readline";

export type ClivoOption = {
  name: string;
  label?: string;
  letter?: string;
};

export type ClivoParams = {
  args: string[];
  parseFrom?: number;
  options: ClivoOption[];
  acceptUnspecifiedOptions?: boolean;
};

export type ClivoDictionary = Record<string, string[]>;

export type ClivoAction = {
  name: string;
  action: () => Promise<void>;
};

export type ClivoChoice = {
  name: string;
  label?: string;
};

export type ClivoWorkflowType = "options" | "text" | "number";
export type ClivoWorkflowStep = {
  type: ClivoWorkflowType;
  message: string;
  choices?: ClivoChoice[];
};

/**
 * Parses CLI options into a dictionary.
 * @param {ClivoParams} params - The parameters for parsing options.
 * @returns {ClivoDictionary} - The parsed options as a dictionary.
 */
export function parseCli(params: ClivoParams): ClivoDictionary {
  const keyValues: ClivoDictionary = {};
  const args = params.args.slice(params.parseFrom || 2);
  const nameByLetter: Record<string, string> = {};

  const optionNames = new Set<string>();
  const optionLetters = new Set<string>();

  for (const option of params.options) {
    if (optionNames.has(option.name)) {
      throw new Error(`Duplicate option name: ${option.name}`);
    }
    optionNames.add(option.name);
    if (option.letter) {
      if (optionLetters.has(option.letter)) {
        throw new Error(`Duplicate option letter: ${option.letter}`);
      }
      optionLetters.add(option.letter);
      nameByLetter[option.letter] = option.name;
    }
  }

  let followOptions: string[] | null = null;
  let followValue: any;

  const addValue = (key: string, value: string) => {
    if (!keyValues[key]) {
      keyValues[key] = [];
    }
    keyValues[key].push(value);
  };

  const addValues = (key: string, values: string[]) => {
    if (!keyValues[key]) {
      keyValues[key] = [];
    }
    if (values.length > 0) {
      keyValues[key].push(...values);
    } else {
      keyValues[key].push("yes");
    }
  };

  const addFollowOptions = (value?: string) => {
    for (const key of followOptions) {
      if (optionNames.has(key) || params.acceptUnspecifiedOptions) {
        if (value != null) {
          addValue(key, value);
        } else if (keyValues[key] == null) {
          addValue(key, "yes");
        }
      }
    }
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      if (followOptions != null) {
        addFollowOptions();
      }
      const [key, ...values] = args[i].slice(2).split("=");
      followOptions = [key];

      if (values.length > 0) {
        if (optionNames.has(key) || params.acceptUnspecifiedOptions) {
          addValues(key, values);
        }
      }
    } else if (args[i].startsWith("-")) {
      if (followOptions != null) {
        addFollowOptions();
      }
      followOptions = null;
      const [letters, ...values] = args[i].slice(1).split("=");
      for (const letter of letters) {
        const key =
          nameByLetter[letter] || (params.acceptUnspecifiedOptions && letter);
        if (key) {
          if (followOptions == null) {
            followOptions = [];
          }
          if (values.length > 0) {
            addValues(key, values);
          } else {
            followOptions.push(key);
          }
        }
      }
    } else if (followOptions != null) {
      addFollowOptions(args[i]);
    }
  }
  if (followOptions != null) {
    addFollowOptions();
  }
  return keyValues;
}

/**
 * Prompts the user to select an option from a list of choices.
 * @param {string} message - The message to display to the user.
 * @param {ClivoChoice[]} choices - The list of choices to present to the user.
 * @returns {Promise<ClivoChoice>} The selected choice.
 */
export async function promptOptions(
  message: string,
  choices: ClivoChoice[],
): Promise<ClivoChoice> {
  return new Promise(
    (
      resolve: (value: ClivoChoice) => void,
      reject: (reason?: any) => void,
    ): void => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      console.log(message);
      choices.forEach((choice, index) => {
        console.log(`${index + 1}. ${choice}`);
      });

      rl.question("Select an option: ", (answer) => {
        const choiceIndex = parseInt(answer, 10) - 1;
        rl.close();
        if (choiceIndex >= 0 && choiceIndex < choices.length) {
          resolve(choices[choiceIndex]);
        } else {
          reject(new Error("Invalid option, please try again."));
        }
      });
    },
  ).catch(() => promptOptions(message, choices));
}

/**
 * Prompts the user to input text.
 * @param {string} message - The message to display to the user.
 * @returns {Promise<string>} The input text.
 */
export async function promptText(message: string): Promise<string> {
  return new Promise((resolve: (value: string) => void): void => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(`${message}: `, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Prompts the user to input a number.
 * @param {string} message - The message to display to the user.
 * @returns {Promise<number>} The input number.
 */
export async function promptNumber(message: string): Promise<number> {
  return new Promise(
    (
      resolve: (value: number) => void,
      reject: (reason?: any) => void,
    ): void => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(`${message}: `, (answer) => {
        rl.close();
        const number = parseFloat(answer);
        if (!isNaN(number)) {
          resolve(number);
        } else {
          reject(new Error("Invalid number, please try again."));
        }
      });
    },
  ).catch(() => promptNumber(message));
}

/**
 * Handles complex workflows with menus and multiple input types.
 * @param {string} message - The message to display to the user.
 * @param {Array<ClivoWorkflowStep>} workflow - The workflow to execute.
 * @returns {Promise<any[]>} The results of the workflow.
 */
export async function promptWorkflow(
  message: string,
  workflow: Array<ClivoWorkflowStep>,
): Promise<any[]> {
  console.log(message);
  const results = [];

  for (const step of workflow) {
    if (step.type === "options" && step.choices) {
      const choice = await promptOptions(step.message, step.choices);
      results.push(choice);
    } else if (step.type === "text") {
      const text = await promptText(step.message);
      results.push(text);
    } else if (step.type === "number") {
      const number = await promptNumber(step.message);
      results.push(number);
    }
  }

  return results;
}

/**
 * Handles nested menus with dynamic options.
 * @param {string} message - The message to display to the user.
 * @param {Array<ClivoAction>} menu - The menu options and their corresponding actions.
 */
export async function promptMenu(
  message: string,
  menu: Array<ClivoAction>,
): Promise<void> {
  const choices: ClivoChoice[] = menu.map((item) => {
    return {
      name: item.name,
    };
  });
  const choice = await promptOptions(message, choices);
  const selectedItem = menu.find((item) => item.name === choice.name);
  if (selectedItem) {
    await selectedItem.action();
  }
}
