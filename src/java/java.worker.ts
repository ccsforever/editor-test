import * as worker from "monaco-editor/esm/vs/editor/editor.worker";
import { JavaWorker } from "./javaWorker";

self.onmessage = () => {
  worker.initialize((ctx) => {
    return new JavaWorker(ctx);
  });
};
