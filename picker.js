// Pure helpers for choosing scenes. No DOM access here so they can be tested with Node.

export function filterScenes(scenes, type) {
  if (!type || type === "all") return scenes.slice();
  return scenes.filter((s) => s.type === type);
}

// Fisher-Yates shuffle. `random` is injectable so tests are repeatable.
export function shuffle(items, random = Math.random) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// A deck deals every scene once before any scene repeats.
// When it reshuffles, the first scene of the new pass is never the last scene of the old one.
export function createDeck(scenes, random = Math.random) {
  let order = shuffle(scenes, random);
  let index = -1;
  return {
    size: scenes.length,
    position() {
      return index + 1;
    },
    next() {
      if (order.length === 0) return null;
      index += 1;
      if (index >= order.length) {
        const last = order[order.length - 1];
        order = shuffle(scenes, random);
        if (order.length > 1 && order[0] === last) {
          [order[0], order[1]] = [order[1], order[0]];
        }
        index = 0;
      }
      return order[index];
    },
  };
}

// "06:42" becomes "0642", the way a time is said on the radio.
export function formatTime(time) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time || "");
  return match ? match[1] + match[2] : "";
}
