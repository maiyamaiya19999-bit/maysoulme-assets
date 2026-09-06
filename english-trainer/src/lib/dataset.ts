import datasetUrl from "../data/sentences.json?url";
import type { Dataset } from "./types";

// Dataset — отдельный статический файл (не в JS-бандле): его обновление
// не инвалидирует код приложения, service worker кэширует его для offline.
export async function loadDataset(): Promise<Dataset> {
  const res = await fetch(datasetUrl);
  if (!res.ok) throw new Error(`Не удалось загрузить базу предложений (${res.status})`);
  const data = (await res.json()) as Dataset;
  if (!data || !Array.isArray(data.sentences) || typeof data.datasetVersion !== "number") {
    throw new Error("База предложений повреждена");
  }
  return data;
}
