# {{project}}

A Bittensor subnet scaffolded by `preflight new`. Miners answer a signed task, validators
score answers with a pure function and set weights. Built on bittensor 11 (`bt.http_auth`
signed requests, intents for chain writes).

## Run it locally in four commands

```bash
uv sync
preflight local up                 # fresh localnet, a subnet, funded and registered keys
uv run python -m {{package}}.miner      # serves on ::ffff:127.0.0.1 (the chain refuses 127.0.0.1)
uv run python -m {{package}}.validator  # queries miners, scores, sets weights
```

`preflight local status` prints the subnet and the wallets; point `WALLET`, `HOTKEY` and
`WALLET_PATH` at them. Then check every neuron with `preflight doctor <hotkey> --network local`.

## Where to change things

| File | What it is |
|---|---|
| `{{package}}/protocol.py` | The task and the answer |
| `{{package}}/scoring.py` | Your evaluation. Pure and tested in `tests/test_scoring.py` |
| `{{package}}/miner.py` | Verifies the validator's signature, answers |
| `{{package}}/validator.py` | Queries, scores, sets weights |
| `preflight.toml` | Network and netuid |

When a chain call fails, both processes print the `preflight tx` command that explains it.
