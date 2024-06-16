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

#### Parsing CLI arguments

You can assign one or multiple variables to an option in any fashion:

```javascript
const result = parseCli({
  args: [
    "node",
    "index.js",
    "-t",
    "--order=burger",
    "cola",
    "-o=fries",
    "-o",
    "salad",
  ], // sample process.argv input
  options: [
    { name: "order", letter: "o" },
    { name: "takeout", letter: "t" },
  ],
});
// result = { takeout: [ 'yes' ], order: [ 'burger', 'cola', 'fries', 'salad' ] }
```

#### Prompt

```javascript
const choice = await promptOptions("Choose an option:", [
  { name: "opt1", label: "Option 1" },
  { name: "opt2", label: "Option 2" },
  { name: "opt3", label: "Option 3" },
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
    choices: [
      { name: "red", label: "Red" },
      { name: "green", label: "Green" },
      { name: "blue", label: "Blue" },
    ],
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
