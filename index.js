import fs from "fs";
import { cleanedSections } from "./outputFile.js";

let valuesArray = [];
const cleanText = (txt) => {
  return txt
    .replace(/<div [^>]*>(.*?)<\/div>/g, "$1")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/<a [^>]*>(.*?)<\/a>/g, "$1")
    .replace(/<\/?strong>/g, "")
    .replace(/<\/?span>/g, "")
    .replace(/<p [^>]*>(.*?)<\/p>/g, "$1")
    .replace(/<ul [^>]*>(.*?)<\/>/g, "$1")
    .replace(/<\/?li>/g, "")
    .replace(/<\/?u>/g, "")
    .replace(/<\/?p>/g, "")
    .trim();
};

cleanedSections.forEach((clean) => {
  if (clean.sectionChildren) {
    clean.sectionChildren.forEach((classCont) => {
      if (classCont.classContChildren) {
        classCont.classContChildren.forEach((classC) => {
          if (classC.classCode) {
            valuesArray.push(classC.classCode);
          }
          if (classC.classChildren) {
            classC.classChildren.forEach((cla) => {
              if (cla.subClassCode) {
                valuesArray.push(cla.subClassCode);
              }
            });
          }
        });
      }
    });
  }
});

let filteredCodes = valuesArray.filter((code) => !/^[A-Z]\d{2}$/.test(code));

const fetchCode = async (code) => {
  const response = await fetch(
    `https://cdn.ipcpub.wipo.int/media/20230101/20230829011327/IPC/scheme/en/json/${code}.json`
  );
  return response.text();
};

// const fetchAllCodes = async (codes) => {
//   const promises = codes.map((code) => fetchCode(code));
//   const results = await Promise.allSettled(promises);
//   return results;
// };
// const fetchFirstCode = async (codes) => {
//   if (codes.length > 0) {
//     return fetchCode(codes[0]);
//   }
// };

const fetchAllCodes = async (codes) => {
  const promises = codes.map((code) =>
    fetchCode(code)
      .then((response) => {
        try {
          return JSON.parse(response);
        } catch (error) {
          throw new Error("Error parsing JSON: " + error.message);
        }
      })
      .then((data) => {
        const symbolCode = data[0].symbol;
        return extractSymbolAndTitle(data, symbolCode);
      })
  );
  return Promise.allSettled(promises);
};

fetchAllCodes(filteredCodes).then((results) => {
  for (const result of results) {
    if (result.status === "fulfilled") {
      console.log("Success:", result.value);
    } else {
      console.error("Failed:", result.reason);
    }
  }
});

// fetchFirstCode(filteredCodes)
//   .then((response) => {
//     try {
//       return JSON.parse(response);
//     } catch (error) {
//       throw new Error("Error parsing JSON: " + error.message);
//     }
//   })
//   .then((data) => {
//     const symbolCode = data[0].symbol;
//     const extractedData = extractSymbolAndTitle(data, symbolCode);
//   })
//   .catch((error) => {
//     console.error("Error:", error.message);
//   });

function extractSymbolAndTitle(items, symbolCode, result = []) {
  for (const item of items) {
    if (item.symbol && item.title1) {
      result.push({
        symbol: item.symbol,
        title1: cleanText(item.title1),
      });
    }
    if (item.children && Array.isArray(item.children)) {
      extractSymbolAndTitle(item.children, symbolCode, result);
    }
  }

  saveToFile(symbolCode, result);
}

function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9]/g, "_");
}

function saveToFile(nameSymb, data) {
  const sanitizedSymbol = sanitizeFileName(nameSymb);
  const dataToSave = `const result${sanitizedSymbol} = ${JSON.stringify(
    data,
    null,
    2
  )};`;

  fs.writeFile(`group/result${sanitizedSymbol}.js`, dataToSave, (err) => {
    if (err) throw err;
    console.log(`Data has been saved to result${sanitizedSymbol}.js`);
  });
}
