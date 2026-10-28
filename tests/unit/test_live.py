from __future__ import annotations

from preflight.core.live.feed import describe

SIGNER = "5HbScNssaEfioJHXjcXdpyqo1AKnYjymidGF8opcF9rTFZdT"
HOT = "5DU1dvXbvjVRs5omKrbZzLNB6ZL9uNnzQrS1H8MFcSdFS7ww"


def call(module: str, function: str, **args: object) -> dict[str, object]:
    return {"call_module": module, "call_function": function, "call_args": [{"name": k, "value": v} for k, v in args.items()]}


def test_weights_register_stake_transfer_sentences() -> None:
    assert describe(call("SubtensorModule", "set_mechanism_weights", netuid=114, dests=[1, 2, 3]), SIGNER)[:2] == ("weights", "Validator 5HbScN...FZdT set weights on SN114 for 3 UIDs")
    assert describe(call("SubtensorModule", "commit_timelocked_mechanism_weights", netuid=1), SIGNER)[1].endswith("committed encrypted weights on SN1")
    assert describe(call("SubtensorModule", "burned_register", netuid=64, hotkey=HOT), SIGNER)[1] == "5DU1dv...S7ww registered on SN64"
    kind, sentence, netuid, amount = describe(call("SubtensorModule", "add_stake_limit", netuid=64, hotkey=HOT, amount_staked=10_000_000_000), SIGNER)
    assert (kind, netuid, amount) == ("stake", 64, "10 TAO") and "staked 10 TAO to 5DU1dv...S7ww" in sentence
    assert describe(call("Balances", "transfer_keep_alive", dest=HOT, value=1_484_100_000), SIGNER)[1] == "5HbScN...FZdT sent 1.4841 TAO to 5DU1dv...S7ww"


def test_wrappers_unwrap_to_the_inner_call() -> None:
    inner = call("SubtensorModule", "add_stake", netuid=5, hotkey=HOT, amount_staked=1_000_000_000)
    kind, sentence, netuid, _ = describe(call("Utility", "batch_all", calls=[inner, inner, inner]), SIGNER)
    assert kind == "stake" and netuid == 5 and sentence.endswith("and 2 more calls")
    assert describe(call("Proxy", "proxy", real=SIGNER, call=inner), SIGNER)[1].endswith("through a proxy")


def test_shielded_and_unknown_calls_are_honest() -> None:
    assert describe(call("MevShield", "submit_encrypted", ciphertext="0x00"), SIGNER)[0] == "shielded"
    assert describe(call("Foo", "bar"), SIGNER)[1] == "5HbScN...FZdT called Foo.bar"
