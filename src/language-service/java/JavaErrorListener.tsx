import { ANTLRErrorListener, RecognitionException, Recognizer } from "antlr4ts";

export interface IJavaError {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  message: string;
  code: string;
}

export default class JavaErrorListener implements ANTLRErrorListener<any> {
  private errors: IJavaError[] = [];
  syntaxError(
    recognizer: Recognizer<any, any>,
    offendingSymbol: any,
    line: number,
    charPositionInLine: number,
    message: string,
    e: RecognitionException | undefined
  ): void {
    this.errors.push({
      startLineNumber: line,
      endLineNumber: line,
      startColumn: charPositionInLine,
      endColumn: charPositionInLine + 1,
      message,
      code: '123', // This the error code you can customize them as you want
    });
  }

  getErrors(): IJavaError[] {
    return this.errors;
  }
}
