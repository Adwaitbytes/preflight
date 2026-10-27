"""The task validators send and the answer miners return. Plain JSON over signed HTTP."""

from __future__ import annotations

from pydantic import BaseModel

PATH = "/task"


class Task(BaseModel):
    numbers: list[int]


class Answer(BaseModel):
    total: int
