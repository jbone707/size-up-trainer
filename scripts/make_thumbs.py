"""Make a 480 px wide thumbnail in img/thumbs/ for every scene that lacks one.
Run from the repo root: python3 scripts/make_thumbs.py  (needs Pillow)."""
import json, os
from PIL import Image
os.makedirs("img/thumbs", exist_ok=True)
made = 0
for s in json.load(open("scenes.json")):
    out = f"img/thumbs/{s['id']}.jpg"
    if os.path.exists(out):
        continue
    im = Image.open(s["file"]).convert("RGB")
    im.thumbnail((480, 480))
    im.save(out, quality=78, optimize=True, progressive=True)
    made += 1
keep = {f"{s['id']}.jpg" for s in json.load(open("scenes.json"))}
for f in os.listdir("img/thumbs"):
    if f not in keep:
        os.remove(f"img/thumbs/{f}")
print(f"made {made} thumbnails")
