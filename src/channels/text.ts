import { openFilesAtLines } from "../utils";
import { genericHandler } from "./generic";

const TELEVISION_COMMAND = "tv --no-remote text";

export async function textHandler() {
  genericHandler("TV Text", TELEVISION_COMMAND, openFilesAtLines);
}
