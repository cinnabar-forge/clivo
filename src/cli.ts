import { ClivoDictionary, ClivoParams } from "./types.js";

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

  let followOptions: null | string[] = null;

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
    if (followOptions == null) {
      return;
    }
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

  for (const arg of args) {
    if (arg.startsWith("--")) {
      if (followOptions != null) {
        addFollowOptions();
      }
      const [key, ...values] = arg.slice(2).split("=");
      followOptions = [key];

      if (
        (values.length > 0 && optionNames.has(key)) ||
        params.acceptUnspecifiedOptions
      ) {
        addValues(key, values);
      }
    } else if (arg.startsWith("-")) {
      if (followOptions != null) {
        addFollowOptions();
      }
      followOptions = null;
      const [letters, ...values] = arg.slice(1).split("=");
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
      addFollowOptions(arg);
    }
  }

  if (followOptions != null) {
    addFollowOptions();
  }
  return keyValues;
}
