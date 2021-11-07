import pkg from "fs-extra";
const { readFileSync, writeFileSync, ensureDirSync } = pkg;
import path from "path";
import { globbySync } from "globby";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import xml2js from "xml2js";
import cleanCSS from "clean-css";

interface SerialFileSystem {
  [key: string]: string;
}

const sourceDir: string = "../../../cesium/Source";

function btoa(str: string | Buffer): string {
  let buffer: Buffer;

  if (str instanceof Buffer) {
    buffer = str;
  } else {
    buffer = Buffer.from(str.toString(), "binary");
  }

  return buffer.toString("base64");
}
(async function () {
  const __dirname: string = dirname(fileURLToPath(import.meta.url));

  let ExternalData: any = {};
  const fileSystem: SerialFileSystem = {};
  ExternalData.fileSystem = fileSystem;
  //Get draco_decoder.wasm
  ExternalData.fileSystem["thirdparty/draco_decoder.wasm"] = btoa(readFileSync(resolve(__dirname, `${sourceDir}/ThirdParty/draco_decoder.wasm`)));
  //Get Approximate Terrain Heights
  ExternalData.approximateTerrainHeights = JSON.parse(
    readFileSync(resolve(__dirname, `${sourceDir}/Assets/approximateTerrainHeights.json`), { encoding: "utf8" })
  );
  for (let i in ExternalData.approximateTerrainHeights) {
    for (let ii = 0; ii < ExternalData.approximateTerrainHeights[i].length; ii++) {
      ExternalData.approximateTerrainHeights[i][ii] = +ExternalData.approximateTerrainHeights[i][ii].toFixed(1);
    }
  }

  //Generate combined IAU2006_XYS file
  ExternalData.XYS2006_samples = [];
  globbySync([path.join(__dirname, `${sourceDir}/Assets/IAU2006_XYS/*.json`)]).forEach((XYS_file, i) => {
    Array.prototype.push.apply(ExternalData.XYS2006_samples, JSON.parse(readFileSync(`${XYS_file}`, { encoding: "utf8" })).samples);
  });

  for (let i = 0; i < ExternalData.XYS2006_samples.length; i++) {
    ExternalData.XYS2006_samples[i] = +ExternalData.XYS2006_samples[i].toFixed(8);
  }

  //Generate combined Star Fields
  ExternalData.SkyBox = {
    "tycho2t3_80_px.jpg": "positiveX",
    "tycho2t3_80_mx.jpg": "negativeX",
    "tycho2t3_80_py.jpg": "positiveY",
    "tycho2t3_80_my.jpg": "negativeY",
    "tycho2t3_80_pz.jpg": "positiveZ",
    "tycho2t3_80_mz.jpg": "negativeZ"
  };
  globbySync([path.join(__dirname, `${sourceDir}/Assets/Textures/SkyBox/*.jpg`)]).forEach((tycho2t3, i) => {
    let _src = `data:image/jpg;base64, ${readFileSync(tycho2t3, {
      encoding: "base64"
    })}`;
    let _img = path.basename(tycho2t3);
    ExternalData.SkyBox[ExternalData.SkyBox[_img]] = _src;
    delete ExternalData.SkyBox[_img];
  });

  ExternalData.Imagery = {
    BlackMarble: {},
    BlueMarble: {}
  };

  const bmPath: string = path.join(__dirname, "./worldmap/bmng");
  let tilemapresourceFile = readFileSync(path.join(bmPath, "/200406/tilemapresource.xml"), { encoding: "utf8" });

  const bmPath2: string = path.join(__dirname, "./worldmap/blackmarble");
  let tilemapresourceFile2 = readFileSync(path.join(bmPath2, "/2016/tilemapresource.xml"), { encoding: "utf8" });

  var parser = new xml2js.Parser();
  let tilemapresource = await parser.parseStringPromise(tilemapresourceFile).catch((e) => console.log("Bad Parse"));

  let tilemapresource2 = await parser.parseStringPromise(tilemapresourceFile2).catch((e) => console.log("Bad Parse"));

  globbySync([`${bmPath}/200406/**/*.jpg`]).forEach((filename) => {
    let _src = `data:image/jpg;base64, ${readFileSync(filename, {
      encoding: "base64"
    })}`;
    ExternalData.Imagery.BlueMarble.tilemapresource = tilemapresource;
    ExternalData.Imagery.BlueMarble[filename.replace(bmPath, "")] = _src;
  });

  globbySync([`${bmPath2}/2016/**/*.jpg`]).forEach((filename) => {
    let _src = `data:image/jpg;base64, ${readFileSync(filename, {
      encoding: "base64"
    })}`;
    ExternalData.Imagery.BlackMarble.tilemapresource = tilemapresource2;
    ExternalData.Imagery.BlackMarble[filename.replace(bmPath2, "")] = _src;
  });

  ExternalData.Images = {};
  globbySync([
    resolve(__dirname, `${sourceDir}/Widgets/Images`),
    resolve(__dirname, `${sourceDir}/Assets/Images`),
    resolve(__dirname, `${sourceDir}/Assets/Textures/moonSmall.jpg`),
    resolve(__dirname, `${sourceDir}/Assets/Textures/waterNormalsSmall.jpg`),
    resolve(__dirname, `${sourceDir}/Widgets/InfoBox/InfoBoxDescription.css`)
  ]).forEach((filename) => {
    let relativePath = filename.split("/Source/")[1];
    let _ext: any = path.extname(filename).slice(1);
    let _src: any;
    if (_ext !== "css") {
      let _enc = "base64";
      //_src = `data:image/${_ext === "svg" ? "svg+xml" : _ext};${_enc},${readFileSync(filename, { encoding: _enc })}`;
    } else {
      var { styles } = new cleanCSS({ rebase: false }).minify(readFileSync(filename, { encoding: "utf8" }));
      _src = styles;
      styles.match(/[\.\/]{1,}Images\/[^[\)]*[png|jpeg|jpg|gif]/g)?.forEach((m) => {
        let ext = path.extname(m);
        _src = styles.replace(m, `data:image/${ext.slice(1)};base64,${readFileSync(path.resolve(path.dirname(filename), m), { encoding: "base64" })}`);
      });
    }
    ExternalData.Images[relativePath] = _src;
  });

  /* All data must be added above this line*/

  ensureDirSync(__dirname);
  /*
  let serialString: string = "";
  let blankString: string = "";
  for (let prop in ExternalData) {
    serialString += `export const ${prop} = ${JSON.stringify(ExternalData[prop])}; \n`;
    blankString += `export const ${prop} = undefined; \n`;
  }
  */
})();
