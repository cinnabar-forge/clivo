# Clivo

_By Cinnabar Forge_

**DISCLAIMER**: Until version 1.0.0, all versions below should be considered unstable.

Simple CLI tools library

## Getting Started

### Installation

Install clivo using npm:

```bash
npm install clivo
```

### Usage

#### Parsing CLI options

```javascript
const result = parseOptions({
  cli: ["node", "index.js", "--standalone", "--anotherOption"],
  options: [{ name: "standalone" }, { name: "anotherOption" }],
});
```

#### Prompt

```javascript
const choice = await promptOptions("Choose an option:", [
  "Option 1",
  "Option 2",
  "Option 3",
]);
```

```javascript
const text = await promptText("Enter some text:");
```

```javascript
const number = await promptNumber("Enter a number:");
```

```javascript
const workflow = [
  { type: "text", message: "Enter your name" },
  { type: "number", message: "Enter your age" },
  {
    type: "options",
    message: "Choose a color",
    choices: ["Red", "Green", "Blue"],
  },
];

const results = await promptWorkflow("Start workflow", workflow);
```

```javascript
await promptMenu("Main Menu", [
  {
    name: "Projects",
    action: async () => console.log("Projects selected"),
  },
  {
    name: "Workspaces",
    action: async () => console.log("Workspaces selected"),
  },
]);
```

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, feel free to open an issue or create a pull request.

You need Node.js installed on your device.

You can also develop in the Devcontainer mode.

After preparations, install:

```bash
npm ci
```

### Road to 1.0

`TODO`

## License

Clivo is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Authors

- Timur Moziev ([@TimurRin](https://github.com/TimurRin))
