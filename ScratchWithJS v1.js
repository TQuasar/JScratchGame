(function (Scratch) {
  "use strict";

  Scratch.vm.JScratchMounter = {};

  class Eval {
    getInfo() {
      return {
        id: "Evalv1",
        name: "JavaScript",
        blocks: [
          {
            opcode: "runcode",
            blockType: Scratch.BlockType.REPORTER,
            text: "eval[CODE]",
            arguments: {
              CODE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "return vm;",
              },
            },
          },
          {
            opcode: "getAttr",
            blockType: Scratch.BlockType.REPORTER,
            text: "[OBJ].[ATTR]",
            arguments: {
              OBJ: {
                type: null,
                defaultValue: "",
              },
              ATTR: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "",
              },
            },
          },
          {
            opcode: "getAttr2",
            blockType: Scratch.BlockType.REPORTER,
            text: "[OBJ].[ATTR1].[ATTR2]",
            arguments: {
              OBJ: {
                type: null,
                defaultValue: "",
              },
              ATTR1: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "",
              },
              ATTR2: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "",
              }
            },
          },
          {
            opcode: "getAttr3",
            blockType: Scratch.BlockType.REPORTER,
            text: "[OBJ].[ATTR1].[ATTR2].[ATTR3]",
            arguments: {
              OBJ: {
                type: null,
                defaultValue: "",
              },
              ATTR1: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "",
              },
              ATTR2: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "",
              },
              ATTR3: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "",
              },
            },
          },
        ],
      };
    }

    runcode({ CODE }) {
        try {     
          return (new Function("vm", CODE))(Scratch.vm);
        } catch (error) {
          return error;
        }
    }

    getAttr({ OBJ, ATTR }) {
        return OBJ[ATTR];
    }

    getAttr2({ OBJ, ATTR1, ATTR2 }) {
      return OBJ[ATTR1][ATTR2];
    }

    getAttr3({ OBJ, ATTR1, ATTR2, ATTR3 }) {
      return OBJ[ATTR1][ATTR2][ATTR3];
    }
  }

  Scratch.extensions.register(new Eval());
})(Scratch);