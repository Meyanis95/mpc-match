/**
 * Fantasy League Auction Circuit.
 *
 * There are 15 players. Two participants bid on every player.
 * Each participant has a 100-credit budget and can only receive 5 players.
 *
 * For each player, the higher bid wins the player.
 * If bids are equal, the player remains unassigned (0).
 *
 * After the initial assignment, the circuit enforces constraints:
 *   1. Each participant can only have 5 players.
 *   2. The total cost (sum of winning bids) must be ≤ 100 credits.
 *
 * The final allocation is returned as an array of 15 numbers:
 *   - 1 means the player is assigned to participant 1,
 *   - 2 means the player is assigned to participant 2,
 *   - 0 means the player is unassigned.
 *
 * Inputs: 15 bids for participant 1 followed by 15 bids for participant 2.
 */
export default function main(
  // Participant 1 bids for players 1 to 15:
  p1_bid1: number,
  p1_bid2: number,
  p1_bid3: number,
  p1_bid4: number,
  p1_bid5: number,
  p1_bid6: number,
  p1_bid7: number,
  p1_bid8: number,
  p1_bid9: number,
  p1_bid10: number,
  p1_bid11: number,
  p1_bid12: number,
  p1_bid13: number,
  p1_bid14: number,
  p1_bid15: number,
  // Participant 2 bids for players 1 to 15:
  p2_bid1: number,
  p2_bid2: number,
  p2_bid3: number,
  p2_bid4: number,
  p2_bid5: number,
  p2_bid6: number,
  p2_bid7: number,
  p2_bid8: number,
  p2_bid9: number,
  p2_bid10: number,
  p2_bid11: number,
  p2_bid12: number,
  p2_bid13: number,
  p2_bid14: number,
  p2_bid15: number,
): number[] {
  // Assemble bids into fixed-size arrays.
  const p1Bids: number[] = [
    p1_bid1,
    p1_bid2,
    p1_bid3,
    p1_bid4,
    p1_bid5,
    p1_bid6,
    p1_bid7,
    p1_bid8,
    p1_bid9,
    p1_bid10,
    p1_bid11,
    p1_bid12,
    p1_bid13,
    p1_bid14,
    p1_bid15,
  ];
  const p2Bids: number[] = [
    p2_bid1,
    p2_bid2,
    p2_bid3,
    p2_bid4,
    p2_bid5,
    p2_bid6,
    p2_bid7,
    p2_bid8,
    p2_bid9,
    p2_bid10,
    p2_bid11,
    p2_bid12,
    p2_bid13,
    p2_bid14,
    p2_bid15,
  ];
  // Initialize allocation array for 15 players.
  // eslint-disable-next-line prefer-const
  let allocation: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  try {
    if (arrayLoopSum(p1Bids) > 100) {
      throw new Error('Player 1 has illegal bids');
    }

    if (arrayLoopSum(p2Bids) > 100) {
      throw new Error('Player 2 has illegal bids');
    }

    for (let i = 0; i < 15; i++) {
      if (p1Bids[i] > p2Bids[i]) {
        allocation[i] = 1;
      } else if (p2Bids[i] > p1Bids[i]) {
        allocation[i] = 2;
      } else {
        allocation[i] = 0;
      }
    }
  } catch {
    return allocation;
  }

  return allocation;
}

function arrayLoopSum(input: number[]) {
  let res = 0;

  for (let i = 0; i < input.length; i++) {
    res += input[i];
  }

  return res;
}
