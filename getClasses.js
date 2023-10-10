import fs from "fs";
import { ipc } from "./ipc.js";

const seccionArr = ipc.map((seccion) => {
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

const dataToSave = `const cleanedSections = ${JSON.stringify(
  cleanedSections,
  null,
  2
)};`;

fs.writeFile("outputFile.js", dataToSave, (err) => {
  if (err) throw err;
  console.log("Data has been saved to outputFile.js");
});
