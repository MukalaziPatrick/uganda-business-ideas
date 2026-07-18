import { readFile } from "node:fs/promises";
import { join } from "node:path";

import {
  buildEastAfricaCatalog,
  parseCsv,
  type EastAfricaCatalog,
} from "./catalog";

async function readCatalogFile(fileName: string): Promise<string> {
  return readFile(join(process.cwd(), "data", fileName), "utf8");
}

export async function loadEastAfricaCatalog(): Promise<EastAfricaCatalog> {
  const [opportunityCsv, cityCsv, sourceCsv] = await Promise.all([
    readCatalogFile("east-africa-business-categories.csv"),
    readCatalogFile("priority-cities.csv"),
    readCatalogFile("priority-sources.csv"),
  ]);

  return buildEastAfricaCatalog({
    opportunityRows: parseCsv(opportunityCsv),
    cityRows: parseCsv(cityCsv),
    sourceRows: parseCsv(sourceCsv),
  });
}
