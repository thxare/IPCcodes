import fs from "fs";
import { cleanedSections } from "./funcionesInlges/outputFile.js";

const transformarDatos = (datos) => {
  let resultado = [];

  // Recorrer cada sección
  datos.forEach((seccion) => {
    // Verificar si la sección tiene hijos
    if (seccion.sectionChildren) {
      // Recorrer cada hijo en sectionChildren
      seccion.sectionChildren.forEach((classCont) => {
        // Si classCont tiene classContChildren, recorrerlo
        if (classCont.classContChildren) {
          classCont.classContChildren.forEach((clase) => {
            let datosExtraidos = {
              code: clase.classCode,
              description: clase.classDescription,
              category: classCont.classContDescription,
            };
            resultado.push(datosExtraidos);
          });
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
  transformarDatos(cleanedSections),
  null,
  2
)};`;

fs.writeFile("section.json", dataToSave, (err) => {
  if (err) throw err;
  console.log("Data has been saved to section.json");
});
