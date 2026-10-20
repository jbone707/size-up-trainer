// Dispatch logic shared by the Practice and Gallery pages. Pure functions, testable in Node.
// The 1st alarm is the three closest engines to the incident area plus Rescue 1 and Squad 1.
// "Closest" is straight-line distance from the area's center to each station, which matches
// road order across Santa Rosa well enough; an area can pin its own order with "engines".

export const ALWAYS = ["Rescue 1", "Squad 1"];

const CALL_TYPES = {
  "residential": "Residential structure fire",
  "multi-family": "Multi-family structure fire",
  "commercial": "Commercial structure fire",
  "high-rise": "High-rise fire",
  "vegetation": "Vegetation fire",
  "vehicle": "Vehicle fire",
};

export function km(a, b) {
  const r = (d) => (d * Math.PI) / 180;
  const dlat = r(b.lat - a.lat), dlon = r(b.lon - a.lon);
  const x = Math.sin(dlat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dlon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(x));
}

// Returns engine designators, first due first, e.g. ["E4", "E1", "E6"].
export function runOrder(area, stations) {
  if (Array.isArray(area.engines) && area.engines.length === 3) return area.engines.slice();
  return stations
    .filter((s) => typeof s.lat === "number" && typeof s.lon === "number")
    .map((s) => ({ engine: s.engine, d: km(area, s) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3)
    .map((s) => s.engine);
}

export const engineName = (e) => "Engine " + e.replace(/^E/, "");

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
  const engines = runOrder(area, stations);
  return {
    call: callType(scene),
    location: locationFor(scene, area) + ", " + scene.area,
    area: scene.area,
    engines,
    units: [...engines, ...ALWAYS],
    you: engineName(engines[0]),
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
