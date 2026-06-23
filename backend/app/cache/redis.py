import json
import logging
from typing import Optional, Any, Dict
from datetime import timedelta

from redis.asyncio import Redis
from redis.exceptions import RedisError

from app.core.config import settings

logger = logging.getLogger(__name__)


class RedisCache:
    def __init__(self):
        self._client: Optional[Redis] = None
        self.available = False

    async def initialize(self, url: Optional[str] = None) -> None:
        try:
            self._client = Redis.from_url(
                url or settings.redis_url,
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=2,
            )
            await self._client.ping()
            self.available = True
            logger.info("Redis connection established")
        except RedisError as e:
            self.available = False
            logger.warning(f"Redis unavailable (running without cache): {e}")

    async def close(self) -> None:
        if self._client:
            await self._client.close()
            self.available = False

    async def get(self, key: str) -> Optional[str]:
        if not self.available or not self._client:
            return None
        try:
            return await self._client.get(key)
        except RedisError as e:
            logger.warning(f"Redis get failed: {e}")
            return None

    async def set(self, key: str, value: str, expire: int = 300) -> bool:
        if not self.available or not self._client:
            return False
        try:
            await self._client.setex(key, expire, value)
            return True
        except RedisError as e:
            logger.warning(f"Redis set failed: {e}")
            return False

    async def set_json(self, key: str, value: Any, expire: int = 300) -> bool:
        return await self.set(key, json.dumps(value), expire)

    async def get_json(self, key: str) -> Optional[Any]:
        data = await self.get(key)
        if data:
            try:
                return json.loads(data)
            except json.JSONDecodeError:
                return None
        return None

    async def delete(self, key: str) -> bool:
        if not self.available or not self._client:
            return False
        try:
            await self._client.delete(key)
            return True
        except RedisError:
            return False

    async def increment(self, key: str, amount: int = 1) -> Optional[int]:
        if not self.available or not self._client:
            return None
        try:
            return await self._client.incrby(key, amount)
        except RedisError:
            return None

    async def expire(self, key: str, seconds: int) -> bool:
        if not self.available or not self._client:
            return False
        try:
            return await self._client.expire(key, seconds)
        except RedisError:
            return False

    async def rate_limit(self, key: str, max_requests: int, window: int) -> bool:
        if not self.available or not self._client:
            return True
        try:
            current = await self._client.get(key)
            if current is None:
                await self._client.setex(key, window, 1)
                return True
            if int(current) >= max_requests:
                return False
            await self._client.incr(key)
            return True
        except RedisError:
            return True


redis_cache = RedisCache()


async def get_redis() -> RedisCache:
    return redis_cache
