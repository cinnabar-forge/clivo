import { expect } from "chai";
import {
  parseOptions,
  promptMenu,
  promptNumber,
  promptOptions,
  promptText,
  promptWorkflow,
  type ClivoWorkflowStep,
} from "../src/index.js";
import readline from "readline";
import sinon from "sinon";

describe("parseOptions", () => {
  it("should parse long options without values", () => {
    const result = parseOptions({
      cli: ["node", "index.js", "--standalone", "--anotherOption"],
      options: [{ name: "standalone" }, { name: "anotherOption" }],
    });
    expect(result.standalone[0]).to.be.true;
    expect(result.anotherOption[0]).to.be.true;
  });

  it("should parse long options with values", () => {
    const result = parseOptions({
      cli: ["node", "index.js", "--withValue=hehe1=hehe2=hehe3"],
      options: [{ name: "withValue", value: true }],
    });
    expect(result.withValue[0]).to.be.equal("hehe1");
    expect(result.withValue[1]).to.be.equal("hehe2");
    expect(result.withValue[2]).to.be.equal("hehe3");
  });

  it("should parse short options without values", () => {
    const result = parseOptions({
      cli: ["node", "index.js", "-s", "-a"],
      options: [
        { name: "standalone", letter: "s" },
        { name: "anotherOption", letter: "a" },
      ],
    });
    expect(result.standalone[0]).to.be.true;
    expect(result.anotherOption[0]).to.be.true;
  });

  it("should parse combined short options", () => {
    const result = parseOptions({
      cli: ["node", "index.js", "-sa"],
      options: [
        { name: "standalone", letter: "s" },
        { name: "anotherOption", letter: "a" },
      ],
    });
    expect(result.standalone[0]).to.be.true;
    expect(result.anotherOption[0]).to.be.true;
  });

  it("should handle unspecified options when acceptUnspecifiedOptions is true", () => {
    const result = parseOptions({
      cli: ["node", "index.js", "--unspecified"],
      options: [],
      acceptUnspecifiedOptions: true,
    });
    expect(result.unspecified[0]).to.be.true;
  });

  it("should ignore unspecified options when acceptUnspecifiedOptions is false", () => {
    const result = parseOptions({
      cli: ["node", "index.js", "--unspecified"],
      options: [],
      acceptUnspecifiedOptions: false,
    });
    expect(result).to.not.have.property("unspecified");
  });

  it("should handle duplicate options", () => {
    const result = parseOptions({
      cli: ["node", "index.js", "--duplicate", "--duplicate=value"],
      options: [{ name: "duplicate" }],
    });
    expect(result.duplicate[0]).to.be.true;
    expect(result.duplicate[1]).to.be.equal("value");
  });

  it("should handle mixed short and long options", () => {
    const result = parseOptions({
      cli: ["node", "index.js", "-s", "--longOption"],
      options: [{ name: "shortOption", letter: "s" }, { name: "longOption" }],
    });
    expect(result.shortOption[0]).to.be.true;
    expect(result.longOption[0]).to.be.true;
  });

  it("should handle options with equal signs in values", () => {
    const result = parseOptions({
      cli: ["node", "index.js", "--option=part1=part2"],
      options: [{ name: "option", value: true }],
    });
    expect(result.option[0]).to.be.equal("part1");
    expect(result.option[1]).to.be.equal("part2");
  });

  it("should throw error for duplicate option names", () => {
    expect(() =>
      parseOptions({
        cli: ["node", "index.js"],
        options: [{ name: "duplicate" }, { name: "duplicate" }],
      }),
    ).to.throw(Error, "Duplicate option name: duplicate");
  });

  it("should throw error for duplicate option letters", () => {
    expect(() =>
      parseOptions({
        cli: ["node", "index.js"],
        options: [
          { name: "firstOption", letter: "a" },
          { name: "secondOption", letter: "a" },
        ],
      }),
    ).to.throw(Error, "Duplicate option letter: a");
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
        "Option 1",
        "Option 2",
        "Option 3",
      ]);
      expect(choice).to.equal("Option 2");
    });

    it("should throw an error for invalid option", async () => {
      questionStub.onCall(0).yields("4");
      questionStub.onCall(1).yields("1");

      try {
        await promptOptions("Choose an option:", [
          "Option 1",
          "Option 2",
          "Option 3",
        ]);
      } catch (e) {
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
      } catch (e) {
        expect(e.message).to.equal("Invalid number, please try again.");
      }
    });
  });

  describe("promptWorkflow", () => {
    it("should execute a workflow and return the results", async () => {
      questionStub.onCall(0).yields("User text");
      questionStub.onCall(1).yields("100");
      questionStub.onCall(2).yields("2");

      const workflow: ClivoWorkflowStep[] = [
        { type: "text", message: "Enter your name" },
        { type: "number", message: "Enter your age" },
        {
          type: "options",
          message: "Choose a color",
          choices: ["Red", "Green", "Blue"],
        },
      ];

      const results = await promptWorkflow("Start workflow", workflow);
      expect(results).to.deep.equal(["User text", 100, "Green"]);
    });
  });

  describe("promptMenu", function () {
    it("should navigate through a menu and execute actions", async () => {
      questionStub.onCall(0).yields("2");
      questionStub.onCall(1).yields("1");
      questionStub.onCall(2).yields("3");

      const dynamicOptions = async () => {
        const options = ["Option 1", "Option 2", "Option 3"];
        const choice = await promptOptions("Choose an option:", options);
        console.log(`You chose: ${choice}`);
      };

      const workspacesMenu = async () => {
        await promptMenu("Workspaces Menu", [
          { name: "Issues", action: dynamicOptions },
          {
            name: "Not Cloned",
            action: async () => console.log("Not Cloned selected"),
          },
        ]);
      };

      await promptMenu("Main Menu", [
        {
          name: "Projects",
          action: async () => console.log("Projects selected"),
        },
        { name: "Workspaces", action: workspacesMenu },
      ]);

      sinon.assert.calledWith(consoleLogStub, "You chose: Option 3");
    });
  });
});
