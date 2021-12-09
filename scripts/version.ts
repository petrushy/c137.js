import { fstat, readFileSync, writeFileSync } from "fs";
import { JSONSchemaForNPMPackageJsonFiles } from "@schemastore/package";
import cPJ from "../cesium/package.json";
import packageJSON from '../package.json';

packageJSON.version = cPJ.version;
writeFileSync("package.json", JSON.stringify(packageJSON, null, 4));