import fs from "fs";

const url =
  "http://pubcip.oepm.es/classifications/ipc/ipcpub/media/20230101/20230131125835/IPC/scheme/es/json/index.json?_=1697050081847";

async function fetchDataFromURL(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Hubo un error:", error);
    return null;
  }
}

// Uso de la función
(async () => {
  const fetchedData = await fetchDataFromURL(url);
  const seccionArr = fetchedData.map((seccion) => {
    return {
      sectionCode: seccion.symbolcode,
      sectionDescription: seccion.title1,
      sectionChildren: seccion.children,
    };
  });
  const cleanText = (txt) => {
    return txt
      .replace(/<\/?div>/g, "")
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
  const cleanedSections = seccionArr.map((section) => ({
    ...section,
    sectionDescription: section.sectionDescription
      .replace(/<\/?div>/g, "")
      .trim(),
    sectionChildren: section.sectionChildren
      .map((child) => ({
        classContCode: child.symbolcode,
        classContDescription: cleanText(child.title1),
        classContChildren: child.children
          .map((sub) => ({
            classCode: sub.symbolcode,
            classDescription: cleanText(sub.title1),
            classChildren: sub.children
              ?.map((group) => ({
                subClassCode: group.symbolcode,
                subClassDescription: cleanText(group.title1),
              }))
              .filter(
                (subItem) => !subItem.subClassDescription.includes("Note(s)")
              ),
          }))
          .filter(
            (subItem) =>
              !subItem.classDescription.includes("Note(s)") &&
              !subItem.classDescription.startsWith("<table><thead>")
          ),
      }))
      .filter((subItem) => !subItem.classContDescription.includes("Note(s)")),
  }));
  const dataToSave = `${JSON.stringify(cleanedSections, null, 2)};`;
  fs.writeFile("outputFileSpanish.json", dataToSave, (err) => {
    if (err) throw err;
    console.log("Data has been saved to outputFileSpanish.json");
  });
})();