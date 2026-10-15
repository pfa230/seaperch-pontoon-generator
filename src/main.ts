import { DEFAULTS, FILAMENT_DENSITY, type Params } from "./profile";
import { validate, type Errors } from "./validate";
import type { Request, Response } from "./worker";

const form = document.querySelector<HTMLFormElement>("#form")!;
const status = document.querySelector<HTMLElement>("#status")!;
const output = (id: string) => document.querySelector<HTMLElement>(`#${id}`)!;
const buttons = {
  step: document.querySelector<HTMLButtonElement>("#step")!,
  stl: document.querySelector<HTMLButtonElement>("#stl")!,
};
const keys = Object.keys(DEFAULTS) as (keyof Params)[];
const field = (key: keyof Params) =>
  form.elements.namedItem(key) as HTMLInputElement | HTMLSelectElement;

for (const key of keys) field(key).value = String(DEFAULTS[key]);

const worker = new Worker(new URL("./worker.ts", import.meta.url), {
  type: "module",
});
let ready = false;
let latestId = 0;
let current: Params | null = null;

function readParams(): Params {
  const entries = keys.map((key) => {
    const value = field(key).value;
    if (key === "mountType" || key === "filament") return [key, value];
    return [key, value.trim() === "" ? NaN : Number(value)];
  });
  return Object.fromEntries(entries);
}

function showErrors(errors: Errors) {
  for (const key of keys) {
    const input = field(key);
    const label = input.closest("label")!;
    label.querySelector(".error")?.remove();
    input.removeAttribute("aria-invalid");
    const message = errors[key];
    if (message) {
      input.setAttribute("aria-invalid", "true");
      const error = document.createElement("small");
      error.className = "error";
      error.textContent = message;
      label.append(error);
    }
  }
}

function showReadout(volumes?: { displaced: number; material: number }) {
  const text = (value: number, unit: string) =>
    volumes ? `${value.toFixed(1)} ${unit}` : "–";
  const mass = volumes ? volumes.material * FILAMENT_DENSITY[current!.filament] : 0;
  const displaced = volumes?.displaced ?? 0;
  output("displaced").textContent = text(displaced, "mL");
  output("mass").textContent = text(mass, "g");
  output("lift").textContent = text(displaced * 1.0 - mass, "g");
}

function enableDownloads(enabled: boolean) {
  buttons.step.disabled = buttons.stl.disabled = !enabled;
}

function send(request: Omit<Request, "id">) {
  latestId += 1;
  worker.postMessage({ ...request, id: latestId });
  status.textContent = ready ? "Generating…" : "Loading the CAD kernel…";
}

function update() {
  const params = readParams();
  const errors = validate(params);
  showErrors(errors);
  showReadout();
  enableDownloads(false);
  if (Object.keys(errors).length > 0) {
    current = null;
    status.textContent = "Fix the marked inputs.";
    return;
  }
  current = params;
  send({ params });
}

function fileName(p: Params, format: "step" | "stl") {
  return `pontoon_d${p.diameter}_l${p.length}_${p.mountType}_a${p.angle}.${format}`;
}

worker.onmessage = (event: MessageEvent<Response>) => {
  const response = event.data;
  if (response.type === "ready") {
    ready = true;
    if (current) status.textContent = "Generating…";
    return;
  }
  if (response.id !== latestId || !current) return;
  status.textContent = "";
  switch (response.type) {
    case "volumes":
      showReadout(response);
      enableDownloads(true);
      break;
    case "file": {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(response.file);
      link.download = fileName(current, response.format);
      link.click();
      URL.revokeObjectURL(link.href);
      enableDownloads(true);
      break;
    }
    case "failed":
      status.textContent = `Could not generate this pontoon: ${response.message}`;
      break;
  }
};

for (const format of ["step", "stl"] as const) {
  buttons[format].addEventListener("click", () => {
    enableDownloads(false);
    send({ params: current!, format });
  });
}

form.addEventListener("input", update);
update();
