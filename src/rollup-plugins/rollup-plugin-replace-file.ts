import { existsSync, readFileSync } from "fs";
import { resolve, dirname } from "path";

export function replace(srcFolder: string, replacementFolder: string, debug: boolean) {
    let resolvedSrcFolder = resolve(srcFolder);
    let resolvedReplacementFolder = resolve(replacementFolder);

    return {
        name: "replaceFile",
        resolveId(source: string, importer: string) {
            if (!importer) return null;
            let resolvedFile = resolve(dirname(importer), source);
            if (existsSync(resolvedFile)) return null;
            let replacementFile = resolvedFile.replace(resolvedSrcFolder, resolvedReplacementFolder);

            if (existsSync(replacementFile)) return replacementFile;
            return null;
        },
        transform(code: string) {
            return code;
        },
        load(id: string) {
            let rFile = id.replace(resolvedSrcFolder, resolvedReplacementFolder);
            if (debug && existsSync(rFile)) {
                console.log("Replacing:", resolve(process.cwd(), srcFolder), "-->", rFile);
            }
            return existsSync(rFile) ? readFileSync(rFile, "utf8") : null;
        }
    };
}