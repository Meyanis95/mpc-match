import { EmpWasmBackend } from 'emp-wasm-backend';
import { Protocol } from 'mpc-framework';
import * as summon from 'summon-ts';
import getCircuitFiles from './getCircuitFiles';

export default async function generateProtocol() {
  await summon.init();

  const circuit = summon.compileBoolean(
    'circuit/main.ts',
    16,
    await getCircuitFiles(),
  );

  const outputKeys = [
    'main[0]',
    'main[1]',
    'main[2]',
    'main[3]',
    'main[4]',
    'main[5]',
    'main[6]',
    'main[7]',
    'main[8]',
    'main[9]',
    'main[10]',
    'main[11]',
    'main[12]',
    'main[13]',
    'main[14]',
  ];

  const mpcSettings = [
    {
      name: 'alice',
      inputs: [
        'p1_bid1',
        'p1_bid2',
        'p1_bid3',
        'p1_bid4',
        'p1_bid5',
        'p1_bid6',
        'p1_bid7',
        'p1_bid8',
        'p1_bid9',
        'p1_bid10',
        'p1_bid11',
        'p1_bid12',
        'p1_bid13',
        'p1_bid14',
        'p1_bid15',
      ],
      outputs: outputKeys,
    },
    {
      name: 'bob',
      inputs: [
        'p2_bid1',
        'p2_bid2',
        'p2_bid3',
        'p2_bid4',
        'p2_bid5',
        'p2_bid6',
        'p2_bid7',
        'p2_bid8',
        'p2_bid9',
        'p2_bid10',
        'p2_bid11',
        'p2_bid12',
        'p2_bid13',
        'p2_bid14',
        'p2_bid15',
      ],
      outputs: outputKeys,
    },
  ];

  return new Protocol(circuit, mpcSettings, new EmpWasmBackend());
}
