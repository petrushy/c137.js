import path from "path";
import { writeFileSync } from "fs";
import { globbySync } from "globby";

/*Build Combined Worker Files*/
let workerBundleName = "cesiumWorkers";
const workerPaths = globbySync(["./cesium/Source/Workers", "!./cesium/Source/Workers/cesiumWorkerBootstrapper.js"]);

let _workerImports: Array<string> = [];
let _workerProperties: Array<string> = [];

workerPaths.forEach((_fullPath: string) => {
  if (_fullPath.indexOf(workerBundleName) === -1) {
    let _file = path.basename(_fullPath);
    let _parameterName = path.basename(_fullPath, path.extname(_file));
    _workerImports.push(`import ${_parameterName} from './${_file}';`);
    _workerProperties.push(_parameterName);
  }
});

let _workerSource = `${_workerImports.join("\n")}

export default {
  ${_workerProperties.join(",\n  ")}
};`;

writeFileSync(`./cesium/Source/Workers/${workerBundleName}.js`, _workerSource);