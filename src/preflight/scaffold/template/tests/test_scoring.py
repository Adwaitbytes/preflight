from {{package}}.protocol import Answer, Task
from {{package}}.scoring import normalize, score


def test_correct_answer_scores_one() -> None:
    task = Task(numbers=[1, 2, 3])
    assert score(task, Answer(total=6)) == 1.0
    assert score(task, Answer(total=7)) == 0.0
    assert score(task, None) == 0.0


def test_normalize_drops_zero_scores() -> None:
    assert normalize({1: 1.0, 2: 0.0, 3: 3.0}) == {1: 0.25, 3: 0.75}
    assert normalize({1: 0.0}) == {}
