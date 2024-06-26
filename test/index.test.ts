import { expect } from "chai";
import readline from "readline";
import sinon from "sinon";
import { parseCli } from "../src/cli.js";
import {
  promptMenu,
  promptNumber,
  promptOptions,
  promptText,
  promptWorkflow,
} from "../src/prompts.js";
import { ClivoWorkflowStep } from "../src/types.js";

describe("parseCli", () => {
  it("should parse non-option argument", () => {
    const result = parseCli({
      args: ["node", "index.js", "seth"],
    });
    expect(result["_"][0]).to.be.equal("seth");
  });

  it("should parse non-option arguments", () => {
    const result = parseCli({
      args: ["node", "index.js", "seth", "sobek"],
    });
    expect(result["_"][0]).to.be.equal("seth");
    expect(result["_"][1]).to.be.equal("sobek");
  });

  it("should parse non-option argument before option", () => {
    const result = parseCli({
      args: ["node", "index.js", "seth", "--history=egypt"],
      options: [{ name: "history" }],
    });
    expect(result["_"][0]).to.be.equal("seth");
    expect(result["history"][0]).to.be.equal("egypt");
  });

  it("should parse non-option argument after boolean option (with equalSignValuesOnly)", () => {
    const result = parseCli({
      args: ["node", "index.js", "--history", "seth"],
      equalSignValuesOnly: true,
      options: [{ name: "history" }],
    });
    expect(result["history"][0]).to.be.equal("yes");
    expect(result["_"][0]).to.be.equal("seth");
  });

  it("should parse non-option argument after value option (with equalSignValuesOnly)", () => {
    const result = parseCli({
      args: ["node", "index.js", "--history=egypt", "seth"],
      equalSignValuesOnly: true,
      options: [{ name: "history" }],
    });
    expect(result["history"][0]).to.be.equal("egypt");
    expect(result["_"][0]).to.be.equal("seth");
  });

  it("should parse long options without values", () => {
    const result = parseCli({
      args: ["node", "index.js", "--standalone", "--anotherOption"],
      options: [{ name: "standalone" }, { name: "anotherOption" }],
    });
    expect(result.standalone[0]).to.be.equal("yes");
    expect(result.anotherOption[0]).to.be.equal("yes");
  });

  it("should parse long options with values", () => {
    const result = parseCli({
      args: [
        "node",
        "index.js",
        "--withValue=hehe1=hehe2=hehe3",
        "--alsoValue=almond",
      ],
      options: [{ name: "withValue" }, { name: "alsoValue" }],
    });
    expect(result.withValue[0]).to.be.equal("hehe1");
    expect(result.withValue[1]).to.be.equal("hehe2");
    expect(result.withValue[2]).to.be.equal("hehe3");
    expect(result.alsoValue[0]).to.be.equal("almond");
  });

  it("should parse long options with values and alternative assignment", () => {
    const result = parseCli({
      args: [
        "node",
        "index.js",
        "--withValue",
        "hehe1",
        "hehe2",
        "hehe3",
        "--alsoValue",
        "almond",
      ],
      options: [{ name: "withValue" }, { name: "alsoValue" }],
    });
    expect(result.withValue[0]).to.be.equal("hehe1");
    expect(result.withValue[1]).to.be.equal("hehe2");
    expect(result.withValue[2]).to.be.equal("hehe3");
    expect(result.alsoValue[0]).to.be.equal("almond");
  });

  it("should parse long options with values and mixed assignment 1", () => {
    const result = parseCli({
      args: [
        "node",
        "index.js",
        "--withValue",
        "hehe1",
        "hehe2",
        "hehe3",
        "--alsoValue=almond",
      ],
      options: [{ name: "withValue" }, { name: "alsoValue" }],
    });
    expect(result.withValue[0]).to.be.equal("hehe1");
    expect(result.withValue[1]).to.be.equal("hehe2");
    expect(result.withValue[2]).to.be.equal("hehe3");
    expect(result.alsoValue[0]).to.be.equal("almond");
  });

  it("should parse long options with values and mixed assignment 2", () => {
    const result = parseCli({
      args: [
        "node",
        "index.js",
        "--withValue=hehe1",
        "hehe2",
        "hehe3",
        "--alsoValue=almond",
      ],
      options: [{ name: "withValue" }, { name: "alsoValue" }],
    });
    expect(result.withValue[0]).to.be.equal("hehe1");
    expect(result.withValue[1]).to.be.equal("hehe2");
    expect(result.withValue[2]).to.be.equal("hehe3");
    expect(result.alsoValue[0]).to.be.equal("almond");
  });

  it("should parse long options with values and mixed assignment 3", () => {
    const result = parseCli({
      args: [
        "node",
        "index.js",
        "--withValue=hehe1=hehe2",
        "hehe3",
        "--alsoValue",
        "almond",
      ],
      options: [{ name: "withValue" }, { name: "alsoValue" }],
    });
    expect(result.withValue[0]).to.be.equal("hehe1");
    expect(result.withValue[1]).to.be.equal("hehe2");
    expect(result.withValue[2]).to.be.equal("hehe3");
    expect(result.alsoValue[0]).to.be.equal("almond");
  });

  it("should parse short options without values", () => {
    const result = parseCli({
      args: ["node", "index.js", "-s", "-a"],
      options: [
        { name: "standalone", letter: "s" },
        { name: "anotherOption", letter: "a" },
      ],
    });
    expect(result.standalone[0]).to.be.equal("yes");
    expect(result.anotherOption[0]).to.be.equal("yes");
  });

  it("should parse combined short options", () => {
    const result = parseCli({
      args: ["node", "index.js", "-sa"],
      options: [
        { name: "standalone", letter: "s" },
        { name: "anotherOption", letter: "a" },
      ],
    });
    expect(result.standalone[0]).to.be.equal("yes");
    expect(result.anotherOption[0]).to.be.equal("yes");
  });

  it("should handle unspecified options when acceptUnspecifiedOptions is true", () => {
    const result = parseCli({
      args: ["node", "index.js", "--unspecified"],
      options: [],
      acceptUnspecifiedOptions: true,
    });
    expect(result.unspecified[0]).to.be.equal("yes");
  });

  it("should ignore unspecified options when acceptUnspecifiedOptions is false", () => {
    const result = parseCli({
      args: ["node", "index.js", "--unspecified"],
      options: [],
      acceptUnspecifiedOptions: false,
    });
    expect(result).to.not.have.property("unspecified");
  });

  it("should handle duplicate options", () => {
    const result = parseCli({
      args: ["node", "index.js", "--duplicate", "--duplicate=value"],
      options: [{ name: "duplicate" }],
    });
    expect(result.duplicate[0]).to.be.equal("yes");
    expect(result.duplicate[1]).to.be.equal("value");
  });

  it("should handle mixed short and long options", () => {
    const result = parseCli({
      args: ["node", "index.js", "-s", "--longOption"],
      options: [{ name: "shortOption", letter: "s" }, { name: "longOption" }],
    });
    expect(result.shortOption[0]).to.be.equal("yes");
    expect(result.longOption[0]).to.be.equal("yes");
  });

  it("should handle value to short option 1", () => {
    const result = parseCli({
      args: ["node", "index.js", "-s=hehe"],
      options: [{ name: "shortOption", letter: "s" }],
    });
    expect(result.shortOption[0]).to.be.equal("hehe");
  });

  it("should handle value to short option 2", () => {
    const result = parseCli({
      args: ["node", "index.js", "-s", "hehe"],
      options: [{ name: "shortOption", letter: "s" }],
    });
    expect(result.shortOption[0]).to.be.equal("hehe");
  });

  it("should handle values to short option", () => {
    const result = parseCli({
      args: ["node", "index.js", "-s", "hehe1", "hehe2"],
      options: [{ name: "shortOption", letter: "s" }],
    });
    expect(result.shortOption[0]).to.be.equal("hehe1");
    expect(result.shortOption[1]).to.be.equal("hehe2");
  });

  it("should handle same values to short options", () => {
    const result = parseCli({
      args: ["node", "index.js", "-ab", "hehe1", "hehe2"],
      options: [
        { name: "alpha", letter: "a" },
        { name: "beta", letter: "b" },
      ],
    });
    expect(result.alpha[0]).to.be.equal("hehe1");
    expect(result.alpha[1]).to.be.equal("hehe2");
    expect(result.beta[0]).to.be.equal("hehe1");
    expect(result.beta[1]).to.be.equal("hehe2");
  });

  it("should handle same values to short options", () => {
    const result = parseCli({
      args: ["node", "index.js", "-a", "-b", "good"],
      options: [
        { name: "alpha", letter: "a" },
        { name: "beta", letter: "b" },
      ],
    });
    expect(result.alpha[0]).to.be.equal("yes");
    expect(result.beta[0]).to.be.equal("good");
  });

  it("should throw error for duplicate option names", () => {
    expect(() =>
      parseCli({
        args: ["node", "index.js"],
        options: [{ name: "duplicate" }, { name: "duplicate" }],
      }),
    ).to.throw(Error, "Duplicate option name: duplicate");
  });

  it("should throw error for duplicate option letters", () => {
    expect(() =>
      parseCli({
        args: ["node", "index.js"],
        options: [
          { name: "firstOption", letter: "a" },
          { name: "secondOption", letter: "a" },
        ],
      }),
    ).to.throw(Error, "Duplicate option letter: a");
  });

  describe("Readme examples", () => {
    it("should verify example 1", () => {
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
        ],
        options: [
          { name: "order", letter: "o" },
          { name: "takeout", letter: "t" },
        ],
      });
      expect(result.takeout[0]).to.be.equal("yes");
      expect(result.order[0]).to.be.equal("burger");
      expect(result.order[1]).to.be.equal("cola");
      expect(result.order[2]).to.be.equal("fries");
      expect(result.order[3]).to.be.equal("salad");
    });
    it("should verify example 2", () => {
      const result = parseCli({
        args: [
          "node",
          "index.js",
          "-t",
          "--order=burger=cola=fries=salad",
          "burger-earl",
        ], // sample process.argv input
        equalSignValuesOnly: true,
        options: [
          { name: "order", letter: "o" },
          { name: "takeout", letter: "t" },
        ],
      });
      expect(result.takeout[0]).to.be.equal("yes");
      expect(result.order[0]).to.be.equal("burger");
      expect(result.order[1]).to.be.equal("cola");
      expect(result.order[2]).to.be.equal("fries");
      expect(result.order[3]).to.be.equal("salad");
      expect(result["_"][0]).to.be.equal("burger-earl");
    });
  });
});

describe("Prompt Functions", () => {
  let questionStub: sinon.SinonStub;
  let consoleLogStub: sinon.SinonStub;

  beforeEach(() => {
    questionStub = sinon.stub(readline.Interface.prototype, "question");
    consoleLogStub = sinon.stub(console, "log");
  });

  afterEach(() => {
    questionStub.restore();
    consoleLogStub.restore();
  });

  describe("promptOptions", () => {
    it("should return the selected option", async () => {
      questionStub.yields("2");

      const choice = await promptOptions("Choose an option:", [
        { name: "opt1", label: "Option 1" },
        { name: "opt2", label: "Option 2" },
        { name: "opt3", label: "Option 3" },
      ]);
      expect(choice.name).to.equal("opt2");
    });

    it("should throw an error for invalid option", async () => {
      questionStub.onCall(0).yields("4");
      questionStub.onCall(1).yields("1");

      try {
        await promptOptions("Choose an option:", [
          { name: "opt1", label: "Option 1" },
          { name: "opt2", label: "Option 2" },
          { name: "opt3", label: "Option 3" },
        ]);
      } catch (e: any) {
        expect(e.message).to.equal("Invalid option, please try again.");
      }
    });
  });

  describe("promptText", () => {
    it("should return the input text", async () => {
      questionStub.yields("Some input text");

      const text = await promptText("Enter some text:");
      expect(text).to.equal("Some input text");
    });
  });

  describe("promptNumber", () => {
    it("should return the input number", async () => {
      questionStub.yields("42");

      const number = await promptNumber("Enter a number:");
      expect(number).to.equal(42);
    });

    it("should throw an error for invalid number", async () => {
      questionStub.onCall(0).yields("invalid");
      questionStub.onCall(1).yields("100");

      try {
        await promptNumber("Enter a number:");
      } catch (e: any) {
        expect(e.message).to.equal("Invalid number, please try again.");
      }
    });
  });

  describe("promptWorkflow", () => {
    it("should execute a workflow and return the results", async () => {
      questionStub.onCall(0).yields("Tim");
      questionStub.onCall(1).yields("28");
      questionStub.onCall(2).yields("3");

      const workflow: ClivoWorkflowStep[] = [
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
      expect(results).to.deep.equal([
        "Tim",
        28,
        { name: "blue", label: "Blue" },
      ]);
    });
  });

  describe("promptMenu", function () {
    it("should navigate through a menu and execute actions", async () => {
      questionStub.onCall(0).yields("2");
      questionStub.onCall(1).yields("1");
      questionStub.onCall(2).yields("3");

      const dynamicOptions = async () => {
        const options = [
          { name: "opt1", label: "Option 1" },
          { name: "opt2", label: "Option 2" },
          { name: "opt3", label: "Option 3" },
        ];
        const choice = await promptOptions("Choose an option:", options);
        console.log(`You chose: ${choice.label}`);
      };

      const workspacesMenu = async () => {
        await promptMenu("Workspaces Menu", [
          { label: "Issues", action: dynamicOptions },
          {
            label: "Not Cloned",
            action: async () => console.log("Not Cloned selected"),
          },
        ]);
      };

      await promptMenu("Main Menu", [
        {
          label: "Projects",
          action: async () => console.log("Projects selected"),
        },
        { label: "Workspaces", action: workspacesMenu },
      ]);

      sinon.assert.calledWith(consoleLogStub, "You chose: Option 3");
    });
  });
});
