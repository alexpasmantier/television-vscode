import { openFiles } from "../utils";
import { genericHandler } from "./generic";

const TELEVISION_COMMAND = "tv --no-remote files";

export async function filesHandler() {
  genericHandler("TV Files", TELEVISION_COMMAND, openFiles);
}
