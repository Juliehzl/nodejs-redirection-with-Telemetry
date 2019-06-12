// Mocked vscode module

const mockListener = {
// tslint:disable-next-line: no-empty
  dispose: () => {}
};

const mockConfig = {
  get: (key: string, defaultValue: any) => {
    if (key === "enableTelemetry") {
      return true;
    }
  }
};

export const workspace = {
  getConfiguration: () => mockConfig,
  onDidChangeConfiguration: () => mockListener
};

class VSCodeEnv {
  public machineId: string;
  public sessionId: string;

  public setIds(mid: string, sid: string) {
    this.machineId = mid;
    this.sessionId = sid;
  }
}

export const env: VSCodeEnv = new VSCodeEnv();
