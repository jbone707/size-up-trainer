"""Runs on GitHub's machines (see .github/workflows/build-maps.yml).
1. Looks up each station address with OpenStreetMap's Nominatim (one request a second, per its policy).
2. Looks up the first street location of each area, as a check on the hand-placed center point.
3. Downloads OpenStreetMap tiles and stitches one citywide map and one close-up per area.
Writes everything to maps/ with maps/maps.json holding the tile origin of each picture,
so the page can place markers by latitude and longitude. Attribution: OpenStreetMap contributors."""
import json, math, os, re, time, io, urllib.request, urllib.parse
from PIL import Image

UA = "SizeUpTrainer/1.0 (https://github.com/jbone707/size-up-trainer; training tool, low volume)"
os.makedirs("maps", exist_ok=True)

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()

def geocode(q):
    time.sleep(1.1)
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode({"q": q, "format": "json", "limit": 1, "countrycodes": "us"})
    try:
        res = json.loads(get(url))
        if res:
            return float(res[0]["lat"]), float(res[0]["lon"]), res[0].get("display_name", "")
    except Exception as e:
        print("geocode failed", q, e)
    return None

def km(a, b):
    dlat = math.radians(b[0] - a[0]); dlon = math.radians(b[1] - a[1])
    x = math.sin(dlat / 2) ** 2 + math.cos(math.radians(a[0])) * math.cos(math.radians(b[0])) * math.sin(dlon / 2) ** 2
    return 6371 * 2 * math.asin(math.sqrt(x))

def tile_xy(lat, lon, z):
    n = 2 ** z
    x = (lon + 180) / 360 * n
    y = (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n
    return x, y

tile_cache = {}
def tile(z, x, y):
    k = (z, x, y)
    if k not in tile_cache:
        time.sleep(0.15)
        tile_cache[k] = Image.open(io.BytesIO(get(f"https://tile.openstreetmap.org/{z}/{x}/{y}.png"))).convert("RGB")
    return tile_cache[k]

def stitch(z, x0, y0, nx, ny, out):
    img = Image.new("RGB", (nx * 256, ny * 256))
    for i in range(nx):
        for j in range(ny):
            img.paste(tile(z, x0 + i, y0 + j), (i * 256, j * 256))
    img.save(out, quality=85, optimize=True)
    return {"z": z, "x0": x0, "y0": y0, "w": nx * 256, "h": ny * 256}

slug = lambda s: re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
stations = json.load(open("data/stations.json"))
areas = json.load(open("data/areas.json"))
report = {"stations": [], "areas": []}

def intersection(a, b):
    """Point where two named roads meet in Santa Rosa, from OpenStreetMap road data (Overpass)."""
    q = f"""[out:json][timeout:25];
area["name"="Santa Rosa"]["boundary"="administrative"]->.sr;
way(area.sr)["highway"]["name"="{a}"]->.a;
way(area.sr)["highway"]["name"="{b}"]->.b;
node(w.a)->.na; node(w.b)->.nb;
node.na.nb;
out;"""
    try:
        time.sleep(1.1)
        req = urllib.request.Request("https://overpass-api.de/api/interpreter", data=urllib.parse.urlencode({"data": q}).encode(), headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=60) as r:
            els = json.loads(r.read()).get("elements", [])
        if els:
            lat = sum(e["lat"] for e in els) / len(els); lon = sum(e["lon"] for e in els) / len(els)
            return lat, lon, f"{a} and {b} ({len(els)} shared nodes)"
    except Exception as e:
        print("intersection failed", a, b, e)
    return None

for s in stations:
    if isinstance(s.get("lat"), (int, float)) and isinstance(s.get("lon"), (int, float)):
        g = (s["lat"], s["lon"], "fixed point in data/stations.json")
    else:
        g = intersection(*s["intersection"]) if s.get("intersection") else geocode(s["address"])
    if g:
        s["lat"], s["lon"] = round(g[0], 5), round(g[1], 5)
    report["stations"].append({"station": s["station"], "found": bool(g), "match": g[2] if g else ""})

for a in areas:
    loc = a["locations"][0]
    q = re.sub(r"^(\d+) block of ", r"\1 ", loc) + ", Santa Rosa, CA"
    g = geocode(q) if not loc.startswith(("Highway", "Santa Rosa Creek")) else None
    entry = {"area": a["area"], "query": q, "found": bool(g)}
    if g:
        entry["km_from_center"] = round(km((a["lat"], a["lon"]), g[:2]), 2)
        entry["match"] = g[2]
    report["areas"].append(entry)

meta = {"attribution": "Map data and tiles: OpenStreetMap contributors", "stations": stations, "areas": {}}
# Citywide view
south, north, west, east = 38.385, 38.515, -122.800, -122.580
z = 13
xa, ya = tile_xy(north, west, z); xb, yb = tile_xy(south, east, z)
meta["city"] = stitch(z, int(xa), int(ya), int(xb) - int(xa) + 1, int(yb) - int(ya) + 1, "maps/city.jpg")
# Close-up per area: 768 by 512 pixels cropped exactly around the area point
z = 16
W, H = 768, 512
for a in areas:
    x, y = tile_xy(a["lat"], a["lon"], z)
    fx0, fy0 = x - W / 512, y - H / 512          # fractional tile origin of the crop
    tx0, ty0 = int(math.floor(fx0)), int(math.floor(fy0))
    big = Image.new("RGB", (4 * 256, 3 * 256))
    for i in range(4):
        for j in range(3):
            big.paste(tile(z, tx0 + i, ty0 + j), (i * 256, j * 256))
    ox, oy = round((fx0 - tx0) * 256), round((fy0 - ty0) * 256)
    out = f"maps/{slug(a['area'])}.jpg"
    big.crop((ox, oy, ox + W, oy + H)).save(out, quality=85, optimize=True)
    meta["areas"][a["area"]] = {"z": z, "x0": tx0 + ox / 256, "y0": ty0 + oy / 256, "w": W, "h": H, "file": out}

json.dump(meta, open("maps/maps.json", "w"), indent=2)
json.dump(report, open("maps/geocode-report.json", "w"), indent=2)
print("tiles fetched:", len(tile_cache))
