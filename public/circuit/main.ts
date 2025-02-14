// This obviously doesn't need to be a separate file, but it's here to
// demonstrate that you can split up your summon code like this.
import isEqual from './isEqual.ts';
import isLarger from './isLarger.ts';

export default function main(a: number, b: number) {
  return isEqual(a, b) ? 0 : isLarger(a, b) ? 1 : 2;
}
