import * as monaco from "monaco-editor";
import { WorkerAccessor } from "./setup";
import { languageID } from "./config";
import { BlockContext, Java9Parser } from '../ANTLR/Java9Parser';
import { Ast } from '../language-service/ast';
import { IJavaError } from "../language-service/java/JavaErrorListener";

// import { ITodoLangError } from "../language-service/TodoLangErrorListener";

export default class DiagnosticsAdapter {
    constructor(private worker: WorkerAccessor) {
        const onModelAdd = (model: monaco.editor.IModel): void => {
            let handle: any;
            model.onDidChangeContent(() => {
                // here we are Debouncing the user changes, so everytime a new change is done, we wait 500ms before validating
                // otherwise if the user is still typing, we cancel the
                clearTimeout(handle);
                handle = setTimeout(() => this.validate(model.uri), 500);
            });

            this.validate(model.uri);
            //TODO:AST
            // this.getAST(model.uri);


        };
        monaco.editor.onDidCreateModel(onModelAdd);
        monaco.editor.getModels().forEach(onModelAdd);
    }
    private async validate(resource: monaco.Uri): Promise<void> {
        // get the worker proxy
        const worker = await this.worker(resource)
        // call the validate methode proxy from the langaueg service and get errors
        const errorMarkers = await worker.doValidation();
        // get the current model(editor or file) which is only one
        const model = monaco.editor.getModel(resource);
        // add the error markers and underline them with severity of Error
        monaco.editor.setModelMarkers(model, languageID, errorMarkers.map(toDiagnostics));
    }
    //TODO:AST
    // private async getAST(resource: monaco.Uri): Promise<void> {
    //     // get the worker proxy
    //     const worker = await this.worker(resource)
    //     // call the validate methode proxy from the langaueg service and get errors
    //     const ast = await worker.getAST();
    //     // get the current model(editor or file) which is only one
    //     console.log(ast)
    //     // add the error markers and underline them with severity of Error
    //     // monaco.editor.setModelMarkers(model, languageID, errorMarkers.map(toDiagnostics));
    //
    // }
}
function toDiagnostics(error: IJavaError): monaco.editor.IMarkerData {
    return {
        ...error,
        severity: monaco.MarkerSeverity.Error,
    };
}
