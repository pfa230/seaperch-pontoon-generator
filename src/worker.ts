import init from "replicad-opencascadejs";
import wasmUrl from "replicad-opencascadejs/wasm?url";
import { setOC } from "replicad";
import { exportPontoon, measure, type ModelMesh } from "./model";
import type { Params } from "./profile";

export interface Request {
  id: number;
  params: Params;
  format?: "step" | "stl";
}

export type Response =
  | { type: "ready" }
  | {
      type: "model";
      id: number;
      displaced: number;
      material: number;
      mesh: ModelMesh;
    }
  | { type: "file"; id: number; format: "step" | "stl"; file: Blob }
  | { type: "failed"; id: number; message: string };

const post = (response: Response) => postMessage(response);

const kernel = init({ locateFile: () => wasmUrl, print: () => {} }).then((oc) => {
  setOC(oc);
  post({ type: "ready" });
});

// Only the newest request runs; requests that arrive while a model is being
// built replace one another.
let latest: Request | null = null;

onmessage = (event: MessageEvent<Request>) => {
  latest = event.data;
  kernel.then(() => setTimeout(run));
};

function run() {
  const request = latest;
  if (!request) return;
  latest = null;
  const { id, params, format } = request;
  try {
    if (format) {
      post({ type: "file", id, format, file: exportPontoon(params, format) });
    } else {
      post({ type: "model", id, ...measure(params) });
    }
  } catch (error) {
    post({ type: "failed", id, message: String(error) });
  }
}
