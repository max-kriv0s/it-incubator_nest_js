export function randomString(n: number) {
  let rnd = '';
  while (rnd.length < n) rnd += Math.random().toString(36).substring(2);
  return rnd.substring(0, n);
}
