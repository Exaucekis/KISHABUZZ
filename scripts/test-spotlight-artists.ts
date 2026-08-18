import assert from "node:assert/strict";
import { toSpotlightArtistCards } from "../src/lib/spotlight-artists";

const cards = toSpotlightArtistCards([
  { name: "  Gaz Mawete ", role: "", image: "/artists/gaz-mawete.jpg" },
  { name: "Sans photo", role: "Artiste", image: "  " },
  { name: "  ", role: "Artiste", image: "/artists/x.jpg" },
  { name: "Koffi Olomidé", role: "Légende", image: "/artists/koffi-olomide.jpg" },
]);

assert.equal(cards.length, 2);
assert.equal(cards[0].name, "Gaz Mawete");
assert.equal(cards[0].role, "Artiste");
assert.equal(cards[1].role, "Légende");
assert.equal(toSpotlightArtistCards([]).length, 0);

console.log("spotlight artists tests: ok");
