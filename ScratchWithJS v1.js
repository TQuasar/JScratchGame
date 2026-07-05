function getVM() {
  try {
    const rootElem = document.querySelector("#root,#__next,#app");
    if (!rootElem) return;
    const rootKey = Object.keys(rootElem).find(k => k.startsWith("__reactContainer"));
    if (!rootKey) return;
    const root = rootElem[rootKey];
    if (typeof root != "object" || !root) return;
    const ignoreObj = new Set();

    function search(obj) {
      ignoreObj.add(obj);
      if (typeof obj.getState == "function") {
        const r = obj.getState()?.scratchGui?.vm;
        if (typeof r == "object" && r) return r;
      }
      for (const name in obj) {
        if (name !== "getState" && Object.prototype.hasOwnProperty.call(obj, name)) {
          const value = obj[name];
          if (typeof value == "object" && value && !ignoreObj.has(value)) {
            const r = search(value);
            if (r) return r;
          }
        }
      }
    }

    return search(root);
  } catch (e) {
    window?.console?.error?.(e);
  }
}

let ScratchVM = getVM();

(function (Scratch) {
  "use strict";

  const vm = Scratch.vm ?? ScratchVM;
  vm.JScratchMounter = {};

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
          return (new Function("vm", "window", "eval", "Function", "postMessage", "localStorage", "sessionStorage", "history", "location", "document", "Document", "fetch", "self", "alert", "confirm", "top", "globalThis", CODE))(Scratch.vm ?? ScratchVM, ...(new Array(1000).fill(null)));
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