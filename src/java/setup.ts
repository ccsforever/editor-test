import * as monaco from "monaco-editor";
import { languageExtensionPoint, languageID } from "./config";
import { conf, language } from "./java";
// import { conf } from "./java";
import { JavaWorker } from "./javaWorker";
import { WorkerManager } from "./WorkerManager";
import DiagnosticsAdapter from "./DiagnosticsAdapter";

const testHtml = `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width" />

        <title>Monaco Editor Playgro`

export function setupLanguage() {
    (window as any).MonacoEnvironment = {
        getWorkerUrl: function (moduleId, label) {
            return "./javaWorker.js";
            if (label === languageID)
                return "./javaWorker.js";
            return './editor.worker.js';
        }
    }
    monaco.languages.register(languageExtensionPoint);
    monaco.languages.onLanguage(languageID, () => {
        monaco.languages.setMonarchTokensProvider(languageID, language);
        monaco.languages.setLanguageConfiguration(languageID, conf);
        const client = new WorkerManager();

        const worker: WorkerAccessor = (...uris: monaco.Uri[]): Promise<JavaWorker> => {
            return client.getLanguageServiceWorker(...uris);
        };

        new DiagnosticsAdapter(worker);

        // monaco.languages.registerDocumentFormattingEditProvider(languageID, new TodoLangFormattingProvider(worker));
    });
    monaco.languages.registerHoverProvider(languageID, {
        provideHover: function (model, position) {
            return {
                    range: new monaco.Range(
                        1,
                        1,
                        model.getLineCount(),
                        model.getLineMaxColumn(model.getLineCount())
                    ),
                    contents: [
                        { value: '**SOURCE**' },
                        { value: '```html\n' + testHtml + '\n```' }
                    ]
            };
        }
    });

}

export type WorkerAccessor = (...uris: monaco.Uri[]) => Promise<JavaWorker>;
