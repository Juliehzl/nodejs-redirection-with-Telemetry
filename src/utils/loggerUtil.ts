import * as fse from "fs-extra";
import * as os from "os";
import * as path from "path";

// tslint:disable-next-line: no-namespace
export namespace logger {
  const LOG_FILEPATH: string = path.join(os.tmpdir(), "vscode-java-intaller.log");
  export function log(message?: any, ...optionalParams: any[]) {
    // tslint:disable-next-line: no-console
    console.log(message, ...optionalParams);
    const output = [message, ...optionalParams].map(stringify).join(os.EOL) + os.EOL;
    fse.appendFile(LOG_FILEPATH, output);
  }

  export function error(message?: any, ...optionalParams: any[]) {
    // tslint:disable-next-line: no-console
    console.error(message, ...optionalParams);
    const output = [message, ...optionalParams].map(stringify).join(os.EOL) + os.EOL;
    fse.appendFile(LOG_FILEPATH, output);
  }

  function stringify(obj: any) {
    if (typeof obj === "string") {
      return obj;
    } else if (typeof obj === "object") {
      return JSON.stringify(obj, undefined, 2);
    }
  }
}
