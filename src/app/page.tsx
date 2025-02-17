'use client';

import AsyncQueue from '@/utils/AsyncQueue';
import generateJoiningCode from '@/utils/generateJoiningCode';
import { useCallback, useState } from 'react';
import { RtcPairSocket } from 'rtc-pair-socket';
import styles from './page.module.css';
import generateProtocol from '@/utils/generateProtocol';

// Define the 15 players.
const players = [
  // Goalkeepers:
  {
    id: 1,
    name: 'Ederson',
    team: 'Liverpool',
  },
  {
    id: 2,
    name: 'Manuel Neuer',
    team: 'Bayern Munich',
  },
  // Defenders:
  {
    id: 3,
    name: 'Vand Djick',
    team: 'Liverpool',
  },
  {
    id: 4,
    name: 'Hakimi',
    team: 'PSG',
  },
  {
    id: 5,
    name: 'Ruben Dias',
    team: 'Man City',
  },
  // Midfielders:
  {
    id: 6,
    name: 'Belingham',
    team: 'Real Madrid',
  },
  {
    id: 7,
    name: 'Wirtz',
    team: 'Bayer Leverkusen',
  },
  // Forwards:
  {
    id: 8,
    name: 'Salah',
    team: 'Liverpool',
  },
  {
    id: 9,
    name: 'Dembele',
    team: 'PSG',
  },
  {
    id: 10,
    name: 'Mbappe',
    team: 'Real Madrid',
  },
  {
    id: 11,
    name: 'Yamal',
    team: 'FC Barcelone',
  },
  // Additional players to complete 15:
  {
    id: 12,
    name: 'De Bruyne',
    team: 'Man City',
  },
  {
    id: 13,
    name: 'Laporte',
    team: 'Man City',
  },
  {
    id: 14,
    name: 'Lewandowski',
    team: 'Barcelona',
  },
  {
    id: 15,
    name: 'Ronaldo',
    team: 'Juventus',
  },
];

export default function Home() {
  const [msgQueue] = useState(new AsyncQueue<unknown>());
  const [step, setStep] = useState<number>(1);
  const [joiningCode, setJoiningCode] = useState<string>();
  const [spinner, setSpinner] = useState<boolean>(false);
  const [party, setParty] = useState<string>();
  const [socket, setSocket] = useState<RtcPairSocket>();
  // Initialize bids as an array of 15 zeros.
  const [bids, setBids] = useState<number[]>(Array(15).fill(0));
  const [result, setResult] = useState<number[]>();
  const [progress, setProgress] = useState<number>(0);

  const handleHost = useCallback(async () => {
    const code = generateJoiningCode();
    setJoiningCode(code);
    setStep(2.1);

    await connect(code, 'alice');

    setStep(3);
  }, []);

  const handleJoin = useCallback(() => {
    setStep(2.2);
  }, []);

  const handleJoinSubmit = useCallback(async () => {
    if (joiningCode) {
      setSpinner(true);
      await connect(joiningCode, 'bob');
      setSpinner(false);
      setStep(3);
    }
  }, [joiningCode]);

  const handleSubmitBids = useCallback(async () => {
    const total = bids.reduce((sum, bid) => sum + bid, 0);
    if (total > 100) {
      alert('Total bid exceeds 100 credits. Please adjust your bids.');
      return;
    }
    if (bids.length !== 15) {
      alert('Please enter bids for all 15 players.');
      return;
    }
    setStep(4);
    const result = (await mpcAuction(bids)) ?? [];
    setStep(5);
    setResult(result);
  }, [bids]);

  const connect = useCallback(async (code: string, party: 'alice' | 'bob') => {
    setParty(party);
    const socket = new RtcPairSocket(code, party);
    setSocket(socket);

    socket.on('message', (msg: unknown) => {
      msgQueue.push(msg);
    });

    await new Promise<void>((resolve, reject) => {
      socket.on('open', resolve);
      socket.on('error', reject);
    });
  }, []);

  const mpcAuction = useCallback(
    async (bids: number[]) => {
      if (!party) {
        alert('Party must be set');
        return;
      }
      if (!socket) {
        alert('Socket must be set');
        return;
      }
      if (bids.length !== 15) {
        alert('You must provide 15 bids');
        return;
      }

      let input: Record<string, number>;
      if (party === 'alice') {
        input = {
          p1_bid1: bids[0],
          p1_bid2: bids[1],
          p1_bid3: bids[2],
          p1_bid4: bids[3],
          p1_bid5: bids[4],
          p1_bid6: bids[5],
          p1_bid7: bids[6],
          p1_bid8: bids[7],
          p1_bid9: bids[8],
          p1_bid10: bids[9],
          p1_bid11: bids[10],
          p1_bid12: bids[11],
          p1_bid13: bids[12],
          p1_bid14: bids[13],
          p1_bid15: bids[14],
        };
      } else {
        input = {
          p2_bid1: bids[0],
          p2_bid2: bids[1],
          p2_bid3: bids[2],
          p2_bid4: bids[3],
          p2_bid5: bids[4],
          p2_bid6: bids[5],
          p2_bid7: bids[6],
          p2_bid8: bids[7],
          p2_bid9: bids[8],
          p2_bid10: bids[9],
          p2_bid11: bids[10],
          p2_bid12: bids[11],
          p2_bid13: bids[12],
          p2_bid14: bids[13],
          p2_bid15: bids[14],
        };
      }

      const otherParty = party === 'alice' ? 'bob' : 'alice';
      const protocol = await generateProtocol();
      const session = protocol.join(party, input, (to, msg) => {
        if (to !== otherParty) {
          alert('Unexpected party');
          return;
        }
        socket.send(msg);
        setProgress(progress => progress + msg.byteLength);
      });

      msgQueue.stream((msg: unknown) => {
        if (!(msg instanceof Uint8Array)) {
          throw new Error('Unexpected message type');
        }
        session.handleMessage(otherParty, msg);
        setProgress(progress => progress + msg.byteLength);
      });

      const output = await session.output();

      if (output === null || typeof output !== 'object') {
        throw new Error('Unexpected output');
      }

      const result: number[] = [];
      for (let i = 0; i < 15; i++) {
        const key = `main[${i}]`;
        if (!(key in output)) {
          throw new Error(`Missing key ${key} in output`);
        }
        const value = (output as Record<string, unknown>)[key];
        if (typeof value !== 'number') {
          throw new Error(`Invalid value type for key ${key}`);
        }
        result.push(value);
      }
      return result;
    },
    [party, socket, msgQueue],
  );

  const normalizeProgress = useCallback(() => {
    const TOTAL_BYTES = 248476;
    const percentage = Math.floor((progress / TOTAL_BYTES) * 100);
    return percentage > 1 ? percentage : 0;
  }, [progress]);

  return (
    <div className={styles.app}>
      <div className={styles.header}>MPC Fantasy Auction</div>
      <div className={styles['step-container']}>
        {step === 1 && (
          <div className={styles.step}>
            <div style={{ textAlign: 'left' }}>
              Welcome to the Fantasy Auction example. One party should click
              Host to generate a joining code. The other party should join using
              the code. Then both will enter their bids for 15 players.
            </div>
            <div style={{ marginTop: '1em' }}>
              <button onClick={handleHost} className={styles.button}>
                Host
              </button>
              &nbsp;
              <button onClick={handleJoin} className={styles.button}>
                Join
              </button>
            </div>
          </div>
        )}

        {step === 2.1 && (
          <div className={styles.step}>
            <p>Joining code:</p>
            <div className={styles['code-box']}>{joiningCode}</div>
          </div>
        )}

        {step === 2.2 && (
          <div className={styles.step}>
            <div>
              <label>Enter host code:</label>
              <input
                onChange={event => setJoiningCode(event.target.value)}
                type="text"
              />
            </div>
            <div>
              <button onClick={handleJoinSubmit} className={styles.button}>
                Join
              </button>
            </div>
            {spinner && (
              <div className={styles['spinner-container']}>
                <div className={styles.spinner}></div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className={styles.step}>
            <h3>Enter your bids for each player</h3>
            <div className={styles.playersContainer}>
              {players.map((player, index) => (
                <div key={player.id} className={styles.playerCard}>
                  <div className={styles.playerInfo}>
                    <strong>{player.name}</strong>
                    <div>{player.team}</div>
                  </div>
                  <div className={styles.bidContainer}>
                    <label htmlFor={`bid-${player.id}`}>Bid:</label>
                    <input
                      id={`bid-${player.id}`}
                      type="string"
                      min="0"
                      value={bids[index] || 0}
                      onChange={e => {
                        const newBid = parseInt(e.target.value, 10) || 0;
                        const newBids = [...bids];
                        newBids[index] = newBid;
                        setBids(newBids);
                      }}
                      className={styles.bidInput}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.summary}>
              <div>
                Total Spent:{' '}
                <strong>{bids.reduce((sum, bid) => sum + bid, 0)}</strong> / 100
                credits
              </div>
              {bids.reduce((sum, bid) => sum + bid, 0) > 100 && (
                <div className={styles.error}>
                  Total bid exceeds 100 credits!
                </div>
              )}
            </div>
            <div>
              <button
                onClick={handleSubmitBids}
                disabled={bids.reduce((sum, bid) => sum + bid, 0) > 100}
                className={styles.button}
              >
                Submit Auction
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={styles.step}>
            <p>
              {normalizeProgress() < 1
                ? 'Waiting...'
                : `${normalizeProgress()}%`}
            </p>
            <div className={styles['spinner-container']}>
              <div className={styles.spinner}></div>
            </div>
          </div>
        )}

        {step === 5 && party && (
          <div className={styles.step}>
            <h2>Your allocation:</h2>
            {(() => {
              if (!result) return null;

              const partyMapping: Record<string, number> = {
                alice: 1,
                bob: 2,
              };
              const myAssignment = partyMapping[party];

              const myPlayers = players.filter(
                (player, index) => result[index] === myAssignment,
              );

              return (
                <div>
                  {myPlayers.length > 0 ? (
                    <ul>
                      {myPlayers.map(player => (
                        <li key={player.id}>
                          {player.name} - {player.team}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No players allocated.</p>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
