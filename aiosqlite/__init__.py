"""Lightweight asyncio wrapper for sqlite3 used in tests.

This module provides a very small subset of the public ``aiosqlite`` API so
that the SQLAlchemy ``sqlite+aiosqlite`` dialect can be imported without
requiring the third-party dependency.  It is **not** a production ready
replacement for the real project – it merely provides the behaviour that the
test-suite exercises (connection management, executing statements and fetching
rows).

The implementation executes all sqlite operations in a background thread via
``asyncio.to_thread`` which keeps the event loop responsive while still using
the standard ``sqlite3`` driver.
"""

from __future__ import annotations

import asyncio
import sqlite3
from typing import Any, Iterable, Optional, Sequence

__all__ = [
    "connect",
    "Cursor",
    "Connection",
    "Error",
    "DatabaseError",
    "IntegrityError",
    "NotSupportedError",
    "OperationalError",
    "ProgrammingError",
    "sqlite_version",
    "sqlite_version_info",
    "PARSE_DECLTYPES",
    "PARSE_COLNAMES",
    "Binary",
]


# Re-export sqlite3 symbols so the SQLAlchemy adapter can introspect them.
Error = sqlite3.Error
DatabaseError = sqlite3.DatabaseError
IntegrityError = sqlite3.IntegrityError
NotSupportedError = sqlite3.NotSupportedError
OperationalError = sqlite3.OperationalError
ProgrammingError = sqlite3.ProgrammingError

sqlite_version = sqlite3.sqlite_version
sqlite_version_info = sqlite3.sqlite_version_info

PARSE_DECLTYPES = sqlite3.PARSE_DECLTYPES
PARSE_COLNAMES = sqlite3.PARSE_COLNAMES

Binary = sqlite3.Binary


class _ImmediateQueue:
    """Simplistic stand-in for the internal queue used by aiosqlite."""

    def put_nowait(self, item: tuple[asyncio.Future[Any], Any]) -> None:
        future, function = item
        try:
            result = function()
        except Exception as exc:  # pragma: no cover - helper utility
            future.set_exception(exc)
        else:
            future.set_result(result)


class Cursor:
    """Asynchronous wrapper around ``sqlite3.Cursor``."""

    def __init__(self, connection: "Connection", cursor: sqlite3.Cursor):
        self._connection = connection
        self._cursor = cursor
        self.arraysize = cursor.arraysize
        self.rowcount = -1
        self.lastrowid = -1
        self.description: Optional[Sequence[Any]] = None

    async def execute(self, sql: str, parameters: Optional[Sequence[Any]] = None) -> "Cursor":
        if parameters is None:
            await self._connection._run(self._cursor.execute, sql)
        else:
            await self._connection._run(self._cursor.execute, sql, parameters)

        self.description = self._cursor.description
        self.lastrowid = self._cursor.lastrowid
        self.rowcount = self._cursor.rowcount
        return self

    async def executemany(self, sql: str, seq_of_parameters: Iterable[Sequence[Any]]) -> "Cursor":
        await self._connection._run(self._cursor.executemany, sql, seq_of_parameters)
        self.description = self._cursor.description
        self.lastrowid = self._cursor.lastrowid
        self.rowcount = self._cursor.rowcount
        return self

    async def fetchone(self) -> Optional[Sequence[Any]]:
        return await self._connection._run(self._cursor.fetchone)

    async def fetchall(self) -> list[Sequence[Any]]:
        return await self._connection._run(self._cursor.fetchall)

    async def fetchmany(self, size: Optional[int] = None) -> list[Sequence[Any]]:
        if size is None:
            size = self.arraysize
        return await self._connection._run(self._cursor.fetchmany, size)

    async def close(self) -> None:
        await self._connection._run(self._cursor.close)


class Connection:
    """Async wrapper around ``sqlite3.Connection``."""

    def __init__(self, *args: Any, loop: Optional[asyncio.AbstractEventLoop] = None, **kwargs: Any) -> None:
        self._args = args
        self._kwargs = kwargs
        self._loop = loop
        self._conn: Optional[sqlite3.Connection] = None
        self._lock = asyncio.Lock()
        self._initialized = False
        # Attributes that SQLAlchemy expects to exist on the real aiosqlite
        # connection implementation.
        self._tx = _ImmediateQueue()
        self.daemon = True

    async def _ensure_connection(self) -> sqlite3.Connection:
        if not self._initialized:
            # ``asyncio.to_thread`` requires an active loop; fall back to
            # ``asyncio.get_running_loop`` when none was provided explicitly.
            loop = self._loop or asyncio.get_running_loop()
            self._conn = await asyncio.to_thread(sqlite3.connect, *self._args, **self._kwargs)
            self._initialized = True
        assert self._conn is not None
        return self._conn

    def __await__(self):  # pragma: no cover - exercised implicitly
        return self._ready().__await__()

    async def _ready(self) -> "Connection":
        await self._ensure_connection()
        return self

    async def __aenter__(self) -> "Connection":
        await self._ensure_connection()
        return self

    async def __aexit__(self, exc_type, exc, tb) -> None:
        await self.close()

    async def _run(self, func: Any, *args: Any, **kwargs: Any) -> Any:
        await self._ensure_connection()
        async with self._lock:
            return await asyncio.to_thread(func, *args, **kwargs)

    async def cursor(self) -> Cursor:
        conn = await self._ensure_connection()
        cursor = await asyncio.to_thread(conn.cursor)
        return Cursor(self, cursor)

    async def execute(self, sql: str, parameters: Optional[Sequence[Any]] = None) -> Cursor:
        cursor = await self.cursor()
        await cursor.execute(sql, parameters)
        return cursor

    async def executemany(self, sql: str, seq_of_parameters: Iterable[Sequence[Any]]) -> Cursor:
        cursor = await self.cursor()
        await cursor.executemany(sql, seq_of_parameters)
        return cursor

    async def commit(self) -> None:
        conn = await self._ensure_connection()
        await self._run(conn.commit)

    async def rollback(self) -> None:
        conn = await self._ensure_connection()
        await self._run(conn.rollback)

    async def close(self) -> None:
        if self._initialized and self._conn is not None:
            await self._run(self._conn.close)
            self._initialized = False

    async def create_function(self, *args: Any, **kwargs: Any) -> None:
        conn = await self._ensure_connection()
        await self._run(conn.create_function, *args, **kwargs)

    @property
    def row_factory(self):  # pragma: no cover - thin proxy
        if self._conn is None:
            return None
        return self._conn.row_factory

    @row_factory.setter
    def row_factory(self, value: Any) -> None:
        if self._conn is not None:
            self._conn.row_factory = value
        else:
            # Store for later; the sqlite connection honours this keyword at
            # construction time so we reuse the original kwargs.
            self._kwargs["row_factory"] = value

    @property
    def isolation_level(self) -> Optional[str]:
        if self._conn is None:
            return None
        return self._conn.isolation_level

    @isolation_level.setter
    def isolation_level(self, value: Optional[str]) -> None:
        if self._conn is not None:
            self._conn.isolation_level = value

    @property
    def in_transaction(self) -> bool:
        if self._conn is None:
            return False
        return self._conn.in_transaction


def connect(*args: Any, loop: Optional[asyncio.AbstractEventLoop] = None, **kwargs: Any) -> Connection:
    """Return an awaitable :class:`Connection` wrapper."""

    # When tests pass ``check_same_thread=False`` the sqlite connection becomes
    # usable from the worker threads created by ``asyncio.to_thread``.
    if "check_same_thread" not in kwargs:
        kwargs = {**kwargs, "check_same_thread": False}

    return Connection(*args, loop=loop, **kwargs)

