import * as crypto from "crypto";
import * as getmac from "getmac";
import { logger } from "../utils/loggerUtil";
import * as uuid from "./uuid";

let sessionId: string | undefined;
export function getSessionId(): string {
  if (!sessionId) {
    sessionId = uuid.generateUuid() + Date.now();
  }
  return sessionId;
}

export function getMachineId(): Promise<string> {
  return getMacMachineId().then((id) => id || uuid.generateUuid());
}

function getMacMachineId(): Promise<string> {
  return new Promise<string>((resolve) => {
    try {
      getmac.getMac((error: any, macAddress: string) => {
        if (!error) {
          resolve(crypto.createHash("sha256").update(macAddress, "utf8").digest("hex"));
        } else {
          resolve(undefined);
        }
      });

      // Timeout due to hang with reduced privileges #58392
      // TODO@sbatten: Remove this when getmac is patched
      setTimeout(() => {
        resolve(undefined);
      }, 10000);
    } catch (err) {
      logger.error(err);
      resolve(undefined);
    }
  });
}
