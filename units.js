// Dispatch logic shared by the Practice and Gallery pages. Pure functions, testable in Node.
// Assignments (James, 2026-10-20):
//   structure and vegetation: three closest engines, Rescue 1, Squad 1
//   vehicle fire: the closest engine only
//   vehicle accident (extrication): two closest engines, closest truck, Rescue 1, Squad 1, Battalion Chief
// "Closest" is straight-line distance from the area's center to each station; an area can pin
// its own engine order with "engines" when roads make straight-line order wrong.

const ASSIGNMENTS = {
  "structure":   { engines: 3, truck: false, extra: ["Rescue 1", "Squad 1"] },
  "vehicle-fire": { engines: 1, truck: false, extra: [] },
  "extrication": { engines: 2, truck: true,  extra: ["Rescue 1", "Squad 1", "Battalion Chief"] },
};

const CALL_TYPES = {
  "residential": "Residential structure fire",
  "multi-family": "Multi-family structure fire",
  "commercial": "Commercial structure fire",
  "high-rise": "High-rise fire",
  "vegetation": "Vegetation fire",
  "vehicle": "Vehicle fire",
  "extrication": "Vehicle accident, persons trapped",
};

export function km(a, b) {
  const r = (d) => (d * Math.PI) / 180;
  const dlat = r(b.lat - a.lat), dlon = r(b.lon - a.lon);
  const x = Math.sin(dlat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dlon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(x));
}

const located = (stations) => stations.filter((s) => typeof s.lat === "number" && typeof s.lon === "number");

// Engine designators, first due first, e.g. ["E4", "E1", "E6"].
export function runOrder(area, stations) {
  if (Array.isArray(area.engines) && area.engines.length === 3) return area.engines.slice();
  return located(stations)
    .map((s) => ({ engine: s.engine, d: km(area, s) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3)
    .map((s) => s.engine);
}

export function closestTruck(area, stations) {
  const t = located(stations).filter((s) => s.truck)
    .map((s) => ({ truck: s.truck, d: km(area, s) }))
    .sort((a, b) => a.d - b.d)[0];
  return t ? t.truck : null;
}

export function assignmentOf(scene) {
  if (scene.assignment && ASSIGNMENTS[scene.assignment]) return scene.assignment;
  if (scene.type === "vehicle") return "vehicle-fire";
  if (scene.type === "extrication") return "extrication";
  return "structure";
}

export const unitName = (u) => /^E\d+$/.test(u) ? "Engine " + u.slice(1) : /^T\d+$/.test(u) ? "Truck " + u.slice(1) : u;
export const engineName = unitName;

// The same scene always gets the same street location.
export function locationFor(scene, area) {
  let h = 0;
  for (const c of scene.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const list = area.locations || [];
  return list.length ? list[h % list.length] : "";
}

export function callType(scene) {
  return scene.call || CALL_TYPES[scene.type] || "Fire";
}

// Everything the dispatch card needs for one scene.
export function dispatchFor(scene, areasByName, stations) {
  const area = areasByName[scene.area];
  if (!area) return null;
  const kind = assignmentOf(scene);
  const a = ASSIGNMENTS[kind];
  const engines = runOrder(area, stations).slice(0, a.engines);
  const truck = a.truck ? closestTruck(area, stations) : null;
  const units = [...engines, ...(truck ? [truck] : []), ...a.extra];
  return {
    kind,
    call: callType(scene),
    location: locationFor(scene, area) + ", " + scene.area,
    area: scene.area,
    engines,
    units,
    responding: new Set(units),
    you: unitName(engines[0]),
    channel: "Control 3",
  };
}

// Web Mercator: where a latitude and longitude falls on a stitched tile picture, in percent.
export function placeOnMap(pic, lat, lon) {
  const n = 2 ** pic.z;
  const x = ((lon + 180) / 360) * n;
  const r = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n;
  return { left: ((x - pic.x0) * 256 / pic.w) * 100, top: ((y - pic.y0) * 256 / pic.h) * 100 };
}

// Station details come from data/stations.json; only coordinates come from the built maps.
export function mergeStations(list, mapStations) {
  const at = Object.fromEntries((mapStations || []).map((s) => [s.station, s]));
  return list.map((s) => ({ ...s, lat: at[s.station]?.lat, lon: at[s.station]?.lon }));
}
