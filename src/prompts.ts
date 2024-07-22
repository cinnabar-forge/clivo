import { EventEmitter } from "events";
import readline from "readline";

import { ClivoAction, ClivoChoice, ClivoWorkflowStep } from "./types.js";

const emitter = new EventEmitter();

/**
 * Emits an event to listeners.
 * @param {string} event - The event to emit.
 * @param {(...args: unknown[]) => void} listener - The listener to call when the event is emitted.
 */
export function listenClivoEvent(event: string, listener: (...args: unknown[]) => void): void {
  emitter.on(event, listener);
}

/**
 * Registers signal listeners to handle SIGINT.
 * @param {readline.Interface} readlineInterface - The readline interface to listen for signals on.
 */
function registerSignals(readlineInterface: readline.Interface) {
  const sigintListener = (): void => {
    emitter.emit("clivoCancel");
    readlineInterface.close();
  };
  readlineInterface.on("SIGINT", sigintListener);
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
      reject: (reason?: Error) => void,
    ): void => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      console.log(message);
      choices.forEach((choice, index) => {
        console.log(`${index + 1}. ${choice.label ?? choice.name}`);
      });

      registerSignals(rl);

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

    registerSignals(rl);

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
      reject: (reason?: Error) => void,
    ): void => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      registerSignals(rl);

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
 * @returns {Promise<(ClivoChoice | number | string)[]>} The results of the workflow.
 */
export async function promptWorkflow(
  message: string,
  workflow: ClivoWorkflowStep[],
): Promise<(ClivoChoice | number | string)[]> {
  console.log(message);
  const results: (ClivoChoice | number | string)[] = [];

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
  menu: ClivoAction[],
): Promise<void> {
  const choices: ClivoChoice[] = menu.map((item, index) => {
    return {
      label: item.label,
      name: "act" + (index + 1),
    };
  });
  const choice = await promptOptions(message, choices);
  const selectedItem = menu.find((item) => item.label === choice.label);
  if (selectedItem) {
    await selectedItem.action();
  }
}
