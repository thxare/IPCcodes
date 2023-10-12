import fs from "fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const outputFileSpanish = require("./outputFileSpanish.json");

const transformarDatos = (datos) => {
  let resultado = [];

  // Recorrer cada sección
  datos.forEach((seccion) => {
    if (seccion.sectionChildren) {
      seccion.sectionChildren.forEach((item) => {
        // Si tiene classContChildren, extraemos classContCode y classContDescription
        if (item.classContChildren) {
          item.classContChildren.forEach((clase) => {
            let datosExtraidos = {
              code: clase.classCode,
              description: clase.classDescription,
              category: item.classContDescription,
            };
            resultado.push(datosExtraidos);
          });
        }
        // Si no tiene classContChildren, extraemos classCode y classDescription directamente
        else if (item.classCode && item.classDescription) {
          let datosExtraidos = {
            code: item.classCode,
            description: item.classDescription,
          };
          resultado.push(datosExtraidos);
        }
      });
    }
  });

  return resultado;
};

// Ejemplo de uso:
// const nuevosDatos = transformarDatos(tuJSON);
// console.log(nuevosDatos);
const dataToSave = `${JSON.stringify(
  transformarDatos(outputFileSpanish),
  null,
  2
)};`;

fs.writeFile("sectionSpanish.json", dataToSave, (err) => {
  if (err) throw err;
  console.log("Data has been saved to sectionSpanish.json");
});
