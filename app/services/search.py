from __future__ import annotations

from typing import Any, Iterable

try:
    from meilisearch import Client as MeiliClient
except ImportError:  # pragma: no cover - optional dependency
    MeiliClient = None  # type: ignore

try:
    from elasticsearch import Elasticsearch
except ImportError:  # pragma: no cover - optional dependency
    Elasticsearch = None  # type: ignore

from app.core.config import settings


class SearchService:
    def __init__(self) -> None:
        self.provider = settings.search_provider
        self.client = self._create_client()

    def _create_client(self) -> Any:
        if self.provider == "meilisearch" and settings.search_url and MeiliClient:
            return MeiliClient(settings.search_url, settings.search_api_key)
        if self.provider == "elasticsearch" and settings.search_url and Elasticsearch:
            return Elasticsearch(settings.search_url, api_key=settings.search_api_key)
        return None

    async def index_article(self, article: dict[str, Any]) -> None:
        if not self.client:
            return
        if self.provider == "meilisearch":
            self.client.index("articles").add_documents([article])
        elif self.provider == "elasticsearch":
            self.client.index(index="articles", id=article["id"], document=article)

    async def search_articles(self, query: str) -> list[dict[str, Any]]:
        if not self.client:
            return []
        if self.provider == "meilisearch":
            results = self.client.index("articles").search(query)
            return results.get("hits", [])
        if self.provider == "elasticsearch":
            results = self.client.search(index="articles", body={"query": {"multi_match": {"query": query}}})
            hits = results.get("hits", {}).get("hits", [])
            return [hit.get("_source", {}) for hit in hits]
        return []

    async def remove_articles(self, ids: Iterable[int]) -> None:
        if not self.client:
            return
        ids_list = list(ids)
        if self.provider == "meilisearch":
            self.client.index("articles").delete_documents(ids_list)
        elif self.provider == "elasticsearch":
            for doc_id in ids_list:
                self.client.delete(index="articles", id=doc_id, ignore=[404])


def get_search_service() -> SearchService:
    return SearchService()
