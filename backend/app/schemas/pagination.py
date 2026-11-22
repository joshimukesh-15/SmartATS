from typing import Generic, TypeVar, List, Any
from pydantic import BaseModel
from fastapi.params import Param

T = TypeVar("T")


def resolve_param(val: Any, fallback: Any = None) -> Any:
    if isinstance(val, Param):
        return fallback if val.default is ... else val.default
    return val if val is not None else fallback


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    limit: int
    offset: int

    def __iter__(self):
        return iter(self.items)

    def __getitem__(self, index):
        return self.items[index]

    def __len__(self):
        return len(self.items)
