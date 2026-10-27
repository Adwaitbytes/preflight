import type { GuideSectionId } from "@/lib/guide";

export interface Term {
  term: string;
  definition: string;
  /** Other words people search for */
  aka?: string[];
  section?: GuideSectionId;
}

/** Fragment id of a term's row in the glossary, shared by the glossary and the inline term popovers */
export function glossaryAnchor(term: string): string {
  return `term-${term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}

/** Definitions follow https://www.bittensor.com/docs (network, emissions, consensus, mining, validating, timelock) */
export const GLOSSARY: Term[] = [
  { term: "Activity cutoff", definition: "Blocks a validator can go without setting weights before the epoch treats it as inactive and ignores its weights. About 5,000 blocks by default", section: "validator" },
  { term: "Alpha", definition: "Each subnet's own token, traded against TAO in the subnet's pool. Emission is paid in alpha, and stake on a subnet is held in alpha", aka: ["α", "subnet token"], section: "basics" },
  { term: "Axon", definition: "The IP and port a miner publishes on chain so validators can find it. Publishing it does not start a server: your miner must listen there", aka: ["serve", "ip", "port"], section: "earns-zero" },
  { term: "Block", definition: "One step of the chain, produced every 12 seconds. Every Preflight answer names the block it read", aka: ["block number"] },
  { term: "Bonds", definition: "A validator's smoothed stake in each miner, built up from its past weights. Dividends are paid on bonds to miners that go on to earn" },
  { term: "btcli", definition: "The official Bittensor command line. Preflight's fixes are btcli commands filled in with your own values", aka: ["cli"] },
  { term: "Burn", definition: "What registering a neuron costs. The TAO is recycled, not staked, so deregistering does not refund it", aka: ["registration cost", "burned_register", "recycle"], section: "miner" },
  { term: "Coldkey", definition: "The key that owns funds: transfers, staking, registration and subnet ownership. Keep it off your servers", aka: ["wallet"], section: "basics" },
  { term: "Commit reveal", definition: "A subnet setting where validators send weights encrypted to a future drand round. The chain reveals them itself, so nobody can copy fresh weights", aka: ["crv", "timelock", "commit"], section: "validator" },
  { term: "Consensus", definition: "For each miner, the highest weight that validators holding at least kappa of the stake agree on. Weights above it are clipped", section: "consensus" },
  { term: "Dividends", definition: "What validators earn: their bonds in each miner multiplied by that miner's incentive", section: "validator" },
  { term: "drand", definition: "A public randomness beacon that publishes a round every 3 seconds. Timelocked weight commits are decrypted when their round arrives", aka: ["reveal_round", "quicknet"], section: "failed-tx" },
  { term: "Emission", definition: "The alpha a UID receives each tempo. By default miners get 41% of a subnet's emission, validators and their stakers 41% and the owner 18%", aka: ["rewards"], section: "basics" },
  { term: "Epoch", definition: "The calculation that runs once per tempo: it reads the weights, runs Yuma Consensus and pays out emission", section: "consensus" },
  { term: "Extrinsic", definition: "A transaction sent to the chain, such as burned_register or set_weights. Explorers name it block-index, like 9376733-28", aka: ["transaction", "tx", "call"], section: "failed-tx" },
  { term: "Finney", definition: "Bittensor mainnet. Preflight reads it and never signs or sends anything there", aka: ["mainnet"] },
  { term: "Fork", definition: "A local copy of mainnet state at one block, made with Chopsticks. The simulator runs your extrinsic on it and throws the result away", aka: ["chopsticks", "simulation"], section: "simulate" },
  { term: "Hotkey", definition: "The working key: it holds UIDs on subnets, sets weights and serves the axon. One coldkey can own many hotkeys", aka: ["ss58"], section: "basics" },
  { term: "Hyperparameter", definition: "A per subnet setting stored on chain, such as tempo, kappa or the immunity period. Some are set by the subnet owner, some only by root", aka: ["hparams"], section: "launch" },
  { term: "Immunity period", definition: "Blocks after registering during which a neuron cannot be pruned, so validators have time to find and score it", aka: ["immune"], section: "miner" },
  { term: "Incentive", definition: "A miner's share of the subnet's miner emission, computed from its consensus clipped weights", section: "consensus" },
  { term: "Kappa", definition: "The share of validator stake that has to agree for a weight to count. Typically 50%", aka: ["κ", "majority"], section: "consensus" },
  { term: "Localnet", definition: "A Bittensor chain on your own machine. preflight local up starts one with a subnet, miners and validators already scored", aka: ["local"], section: "surfaces" },
  { term: "Lock cost", definition: "The TAO locked to register a new subnet. It doubles after each registration and decays back toward a floor", aka: ["register_network", "subnet cost"], section: "launch" },
  { term: "Mechanism", definition: "A subnet can run more than one incentive mechanism, each with its own weights. mecid 0 is the first", aka: ["mecid"], section: "failed-tx" },
  { term: "Metagraph", definition: "The table of every neuron on a subnet: UIDs, stake, incentive, trust, emission and axons" },
  { term: "Miner", definition: "A hotkey on a subnet that does the work the subnet asks for, paid according to validators' scores", section: "miner" },
  { term: "Netuid", definition: "A subnet's number. SN64 means netuid 64", aka: ["sn", "subnet id"], section: "basics" },
  { term: "Neuron", definition: "A hotkey holding a UID on a subnet, whether it mines or validates" },
  { term: "Pallet", definition: "A module of the chain's runtime. Almost everything Bittensor specific lives in one pallet, SubtensorModule, and its errors are named after it", aka: ["SubtensorModule", "module"], section: "failed-tx" },
  { term: "Pruning", definition: "Removing the lowest emission neuron that is out of immunity when a full subnet takes a new registration", aka: ["deregistered", "dereg", "kicked"], section: "miner" },
  { term: "Rao", definition: "The smallest unit of TAO: 1 TAO is 1,000,000,000 rao" },
  { term: "Rate limit", definition: "A minimum number of blocks between two actions, such as WeightsSetRateLimit for set_weights or NetworkRateLimit for registering a subnet", aka: ["too fast"], section: "validator" },
  { term: "Runtime", definition: "The chain's own program, compiled to wasm. It decides what every extrinsic does and which error it fails with; the simulator runs it on a fork", aka: ["wasm", "runtime spec"], section: "simulate" },
  { term: "Stake", definition: "TAO a coldkey puts behind a hotkey on a subnet, held as alpha. It decides who gets a validator permit and how much their weights count", aka: ["delegate"], section: "validator" },
  { term: "Stake threshold", definition: "The minimum stake weight a hotkey needs before it can set weights. Mainnet runs around 1,000 TAO equivalent", aka: ["StakeThreshold"], section: "validator" },
  { term: "start_call", definition: "The call a subnet owner makes to switch on emissions and staking for a new subnet", aka: ["start call", "hparams start"], section: "launch" },
  { term: "Subnet", definition: "An independent incentive market with its own task, token and rules, identified by a netuid", aka: ["sn"], section: "basics" },
  { term: "Subtensor", definition: "The Bittensor blockchain, and the runtime pallet whose errors Preflight explains", aka: ["chain"] },
  { term: "TAO", definition: "Bittensor's native token. It pays for registrations, locks and fees, and is staked into subnets", aka: ["τ"], section: "basics" },
  { term: "Tempo", definition: "A subnet's cycle, 360 blocks or about 72 minutes by default. Consensus runs and rewards are paid once per tempo", section: "basics" },
  { term: "Testnet", definition: "A public test chain with TAO that has no value, for trying things before mainnet", aka: ["test"] },
  { term: "Trust", definition: "The share of a miner's weight that survives consensus clipping. Low trust means validators disagree about it", section: "consensus" },
  { term: "UID", definition: "A numbered seat on one subnet. When every seat is taken, a new registration prunes the weakest neuron out of immunity", aka: ["seat"], section: "basics" },
  { term: "Validator", definition: "A hotkey with enough stake to hold a validator permit. It scores miners by setting weights", section: "validator" },
  { term: "Validator permit", definition: "The right to set weights on other UIDs, given each epoch to the top stake holders up to MaxAllowedValidators", aka: ["permit", "vpermit"], section: "validator" },
  { term: "Weights", definition: "A validator's scores for the miners on a subnet, written to the chain with set_weights", aka: ["set_weights"], section: "validator" },
  { term: "Yuma Consensus", definition: "The algorithm the epoch runs to turn weights into incentive and dividends, clipping weight that too little stake agrees with", aka: ["yuma", "yc"], section: "consensus" },
];
