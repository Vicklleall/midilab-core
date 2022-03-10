export function note(key) {
  const k = key.slice(0, -1),
        n = Number(key.slice(-1));
  let i = {A: 0, B: 2, C: 3, D: 5, E: 7, F: 8, G: 10}[k.slice(-1)];
  if (k[0] === 'b') {
    i--;
  } else if (k[0] === '#') {
    i++;
  }
  return n * 12 + i + 9;
}