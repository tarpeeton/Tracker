import { scaleOrdinal } from "d3-scale";
import { schemeTableau10, schemeSet3 } from "d3-scale-chromatic";

  export const MONTHS = [
    "Янв",
    "Фев",
    "Март",
    "Ап",
    "Май",
    "Июнь",
    "Июль",
    "Ав",
    "Сен",
    "Ок",
    "Но",
    "Дек",
  ];


export const COLORS = scaleOrdinal([...schemeTableau10, ...schemeSet3]).range();


 export const DUMMY_DATA = COLORS.slice(0, 6).map((c, index) => ({
   category: `Категория ${index + 1}`,
   price: 1,
 }));
