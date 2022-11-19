import * as React from "react";
import * as monaco from "monaco-editor";
// import parseAndGetASTRoot from "../../language-service/parser";

// function validate(model) {
//   const markers = [];
//   // lines start at 1
//   for (let i = 1; i < model.getLineCount() + 1; i++) {
//     const range = {
//       startLineNumber: i,
//       startColumn: 1,
//       endLineNumber: i,
//       endColumn: model.getLineLength(i) + 1,
//     };
//     const content = model.getValueInRange(range).trim();
//     const number = Number(content);
//     if (Number.isNaN(number)) {
//       markers.push({
//         message: "not a number",
//         severity: monaco.MarkerSeverity.Error,
//         startLineNumber: range.startLineNumber,
//         startColumn: range.startColumn,
//         endLineNumber: range.endLineNumber,
//         endColumn: range.endColumn,
//       });
//     } else if (!Number.isInteger(number)) {
//       markers.push({
//         message: "not an integer",
//         severity: monaco.MarkerSeverity.Warning,
//         startLineNumber: range.startLineNumber,
//         startColumn: range.startColumn,
//         endLineNumber: range.endLineNumber,
//         endColumn: range.endColumn,
//       });
//     }
//   }
//   monaco.editor.setModelMarkers(model, "owner", markers);
// }

const wsUrl = "ws://192.168.9.74:8080";
interface IEditorProps {
  language: string;
}

const Editor: React.FC<IEditorProps> = (props: IEditorProps) => {
  const [token, setToken] = React.useState([]);
  const [text, setText] = React.useState("");
  const [position, setPosition] = React.useState(new monaco.Position(0, 0));
  const [keyPosition, setKeyPosition] = React.useState(
    new monaco.Position(0, 0)
  );
  const [srcId, setSrcId] = React.useState(4);
  let divNode;
  const assignRef = React.useCallback((node) => {
    // On mount get the ref of the div and assign it the divNode
    divNode = node;
  }, []);
  const testCode = `class Simple{
  public static void main(String args[]){
    System.out.println("Hello Java");
  }
}`;

  React.useEffect(() => {
    if (divNode) {
      // const model = monaco.editor.createModel("", "java");
      const codeEditor = monaco.editor.create(divNode, {
        language: props.language,
        minimap: { enabled: true },
        autoIndent: "full",
        theme: "vs-dark",
        mouseWheelZoom: true,
        fontSize: 25,
        value: testCode,
        // model,
      });
      // validate(model);
      // model.onDidChangeContent(() => {
      //   // validate(model);
      // });
      const model = codeEditor.getModel();
      setText(model.getValue());
      model.onDidChangeContent((e) => {
        setText(model.getValue());
        setPosition(codeEditor.getPosition());
      });
      codeEditor.onKeyDown((e) => {
        setKeyPosition(codeEditor.getPosition());
      });
    }
    // const ast = parseAndGetASTRoot(`ADD TODO "Create an editor"\nCOMPLETE TODO "Create an editor"`);
    // console.log(ast);
  }, [assignRef]);

  React.useEffect(() => {
    const tempToken = monaco.editor.tokenize(text, "java");
    console.log("tempToken");
    console.log(tempToken);
    setToken(tempToken);
  }, [text]);

  const setRequest = (targetServiceName: string) => {
    return {
      header: {
        targetServiceName,
        messageType: "REQUEST",
        contentType: "TEXT",
      },
      body: {
        srcId: srcId,
      },
    };
  };

  const onGetButtonClick = async () => {
    const model = monaco.editor.getEditors()[0].getModel();

    const exampleSocket = new WebSocket(wsUrl);
    const request = setRequest("com.tmax.service.sourceCode.DetailSrcService");
    model.setValue("Request srcId " + srcId);
    exampleSocket.onopen = (event) => {
      exampleSocket.send(JSON.stringify(request));
    };

    exampleSocket.onmessage = (event) => {
      console.log(event.data);
      const wsdata = JSON.parse(event.data);
      const lineData = [];
      wsdata.body.data.forEach((d) => {
        lineData.push(d.content);
      });
      model.setValue(lineData.join(""));
    };
  };
  const onChangeSrcId = (event) => {
    setSrcId(event.target.value);
  };

  return (
    <div style={{ height: 500 }}>
      <input
        onChange={onChangeSrcId}
        placeholder="Enter SrcId (Default 4)"
        type="Number"
      ></input>
      <button onClick={onGetButtonClick}>Get Source</button>
      <div ref={assignRef} className="editor-container"></div>
      <div>Content Change Position</div>
      <div>LineNumber : {position.lineNumber}</div>
      <div>Column : {position.column}</div>
      <div>Key Down Position</div>
      <div>LineNumber : {keyPosition.lineNumber}</div>
      <div>Column : {keyPosition.column}</div>
      <div>---</div>
      <div>Token</div>
      {token.map((lineToken) => {
        return (
          <div>
            {lineToken.map((t) => {
              return <span>{t.offset + " "}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
};

export { Editor };
