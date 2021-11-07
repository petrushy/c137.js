import fs from "fs";
import path from "path";
import cleanCSS from "clean-css";

/*Build Combined Widgets CSS File*/
let _cwd: string = process.cwd();
process.chdir("../../../cesium/Source/Widgets");
let ifile: string = "widgets.css";

let additionalStyleText: string = `.cesium-viewer-bottom{z-index:10000}`;

let input: Buffer = fs.readFileSync(ifile);

var { styles } = new cleanCSS({ rebase: false }).minify(input);

styles.match(/[\.|\/]{1,}Images\/[^[\)]*[png|jpeg|jpg|gif]/g)?.forEach((m: string) => {
  let _m: string = m.replace(/^[\.|\/]{1,}/g, "");
  let ext: string = path.extname(_m);
  styles = styles.replace(
    m,
    `data:image/${ext.slice(1)};base64,${fs.readFileSync(_m, {
      encoding: "base64"
    })}`
  );
});
process.chdir(_cwd);
console.log(path.join(_cwd, "viewerCSSMixin.js"));

fs.writeFileSync(
  path.join(_cwd, "viewerCSSMixin.js"),
  `const styleText = \`${styles}${additionalStyleText}\`;
${fs.readFileSync("./src.js", "utf8")}`
);
