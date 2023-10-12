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
        if (item.classContChildren) {
          item.classContChildren.forEach((clase) => {
            let datosExtraidos = {
              code: clase.classCode,
              description: clase.classDescription,
              children: clase.classChildren,
            };
            resultado.push(datosExtraidos);
          });
        }
        // Si no tiene classContChildren, extraemos classCode y classDescription directamente
        else if (item.classCode && item.classDescription) {
          let datosExtraidos = {
            code: item.classCode,
            description: item.classDescription,
            children: item.classChildren,
          };
          resultado.push(datosExtraidos);
        }
      });
    }
  });

  return resultado;
};

const resultado = transformarDatos(outputFileSpanish);
//console.log(resultado)
resultado.forEach((code) => {
  let seccion = code.code.charAt(0); // Obtiene la primera letra, por ejemplo, "G" de "G08"
  let clase = code.code; // Obtiene el código completo, por ejemplo, "G08"

  // Asegurarse de que los directorios existen o crearlos
  if (!fs.existsSync(`seccion/${seccion}`)) {
    fs.mkdirSync(`seccion/${seccion}`);
  }
  if (!fs.existsSync(`seccion/${seccion}/clase`)) {
    fs.mkdirSync(`seccion/${seccion}/clase`);
  }

  // Convertir el objeto a una cadena JSON para guardar
  let dataToSave = JSON.stringify(code.children, null, 2); // El tercer argumento es para formatear el JSON con una indentación de 2 espacios

  fs.writeFile(`seccion/${seccion}/clase/${clase}.json`, dataToSave, (err) => {
    if (err) throw err;
    console.log(`Archivo guardado en: seccion/${seccion}/clase/${clase}.json`);
  });
});
//   let data = code;
//   console.log(data)
//console.log(JSON.stringify(transformarDatos(outputFileSpanish), null, 2));
// const dataToSave = `${JSON.stringify(
//   transformarDatos(outputFileSpanish),
//   null,
//   2
// )};`;

//
//
//
//
