### 현재 Elasticsearch 구동상태 확인

```http
GET / HTTP/1.1
Host: https://search-icomsys-es-5kemlufqgohnofq7x7bqoccxia.ap-northeast-2.es.amazonaws.com

Response

{
    "name": "367478c84cc2d775d1291729eae6f4da",
    "cluster_name": "522294800560:icomsys-es",
    "cluster_uuid": "qrjDztldQACLAQjAnASmVg",
    "version": {
        "number": "7.7.0",
        "build_flavor": "oss",
        "build_type": "tar",
        "build_hash": "unknown",
        "build_date": "2020-08-18T20:35:37.721611Z",
        "build_snapshot": false,
        "lucene_version": "8.5.1",
        "minimum_wire_compatibility_version": "6.8.0",
        "minimum_index_compatibility_version": "6.0.0-beta1"
    },
    "tagline": "You Know, for Search"
}
```

### 현재 저장된 index 확인

```http
GET /_cat/indices?format=json HTTP/1.1
Host: https://search-icomsys-es-5kemlufqgohnofq7x7bqoccxia.ap-northeast-2.es.amazonaws.com

Response

[
    {
        "health": "green",
        "status": "open",
        "index": "kibana_sample_data_ecommerce",
        "uuid": "Y65BfzBeRJqOpeAXawjBnA",
        "pri": "1",
        "rep": "0",
        "docs.count": "4675",
        "docs.deleted": "0",
        "store.size": "4.8mb",
        "pri.store.size": "4.8mb"
    },
    {
        "health": "green",
        "status": "open",
        "index": ".kibana_1",
        "uuid": "OYuUILd4S2qZ7bFDpUNX-Q",
        "pri": "1",
        "rep": "0",
        "docs.count": "39",
        "docs.deleted": "0",
        "store.size": "44kb",
        "pri.store.size": "44kb"
    },
    {
        "health": "yellow",
        "status": "open",
        "index": "guide",
        "uuid": "Adox6JCLQkCidiI3-Wg6KA",
        "pri": "2",
        "rep": "1",
        "docs.count": "5",
        "docs.deleted": "0",
        "store.size": "9kb",
        "pri.store.size": "9kb"
    }
]
```

### 인덱스 생성

은전한닢 을 이용해서, tokenizer 를 설정.

`settings.filter.synonym_filter.synonyms` 로 유사어를 지정. 또는
`settings.filter.synonym_filter.synonyms_path` 로 유사어를 설정 한 파일을 지정한다.

_예)_

```js
// "고객상담실" 은 "고객센터" 의 유사어 이다.
// "인천시" 는 "인천광역시" 의 유사어 이다.

["고객센터,고객상담실", "인천광역시,인천시"];
```

```http
PUT /guide HTTP/1.1
Host: https://search-icomsys-es-5kemlufqgohnofq7x7bqoccxia.ap-northeast-2.es.amazonaws.com
Content-Type: application/json

Response
{
    "settings": {
        "number_of_shards": 2,
        "number_of_replicas": 1,
        "analysis": {
            "tokenizer": {
                "seunjeon": {
                    "type": "seunjeon_tokenizer",
                    "index_eojeol": true,
                    "decompound": true,
                    "index_poses": [
                        "UNK",
                        "EP",
                        "E",
                        "I",
                        "J",
                        "M",
                        "N",
                        "S",
                        "SL",
                        "SH",
                        "SN",
                        "V",
                        "VCP",
                        "XP",
                        "XS",
                        "XR"
                    ]
                }
            },
            "analyzer": {
                "korean_analyzer": {
                    "type": "custom",
                    "tokenizer": "seunjeon_tokenizer",
                    "filter": [
                        "synonym_filter"
                    ]
                }
            },
            "filter": {
                // 유사어 지정
                "synonym_filter": {
                    "type": "synonym",
                    "synonyms": [
                        "고객센터,센터,상담실",
                        "요금,얼마,비싸",
                        "이벤트,행사"
                    ]
                }
            }
        }
    },
    "mappings": {
        "properties": {
            "title": {
                "type": "text",
                "analyzer": "korean_analyzer"
            }
        }
    }
}
```

_상담가이드봇 데이터 bulk api_

> 맨 마지막 라인은, 빈줄 `(\n)` 에 주의
> meta data 와, 데이터는 각각 한줄로 분리

```http
PUT /guide/_bulk HTTP/1.1
Host: https://search-icomsys-es-5kemlufqgohnofq7x7bqoccxia.ap-northeast-2.es.amazonaws.com
Content-Type: application/json

Request

{"index":{"_index": "guide", "_id": 1}}
{"title": "요금정책", "content": "https://s3.ap-northeast-2.amazonaws.com/icomsys.vm/ex_cost.png"}
{"index":{"_index": "guide", "_id": 2}}
{"title": "이달의이벤트", "content": "https://s3.ap-northeast-2.amazonaws.com/icomsys.vm/ex_event.png"}
{"index":{"_index": "guide", "_id": 3}}
{"title": "소비자보호규정", "content": "https://s3.ap-northeast-2.amazonaws.com/icomsys.vm/ex_customer.png"}
{"index":{"_index": "guide", "_id": 4}}
{"title": "부가서비스안내", "content": "https://s3.ap-northeast-2.amazonaws.com/icomsys.vm/ex_service.png"}
{"index":{"_index": "guide", "_id": 5}}
{"title": "약정할인기준", "content": "https://s3.ap-northeast-2.amazonaws.com/icomsys.vm/ex_sale.png"}

```

### 인덱스 확인

```http
GET /guide/_settings HTTP/1.1
Host: https://search-icomsys-es-5kemlufqgohnofq7x7bqoccxia.ap-northeast-2.es.amazonaws.com

Response

{
    "guide": {
        "settings": {
            "index": {
                "number_of_shards": "2",
                "provided_name": "guide",
                "creation_date": "1600320265342",
                "analysis": {
                    "filter": {
                        "synonym_filter": {
                            "type": "synonym",
                            "synonyms": [
                                "고객센터,센터,상담실",
                                "요금,얼마,비싸",
                                "이벤트,행사"
                            ]
                        }
                    },
                    "analyzer": {
                        "korean_analyzer": {
                            "filter": [
                                "synonym_filter"
                            ],
                            "type": "custom",
                            "tokenizer": "seunjeon_tokenizer"
                        }
                    },
                    "tokenizer": {
                        "seunjeon": {
                            "index_eojeol": "true",
                            "index_poses": [
                                "UNK",
                                "EP",
                                "E",
                                "I",
                                "J",
                                "M",
                                "N",
                                "S",
                                "SL",
                                "SH",
                                "SN",
                                "V",
                                "VCP",
                                "XP",
                                "XS",
                                "XR"
                            ],
                            "decompound": "true",
                            "type": "seunjeon_tokenizer"
                        }
                    }
                },
                "number_of_replicas": "1",
                "uuid": "Adox6JCLQkCidiI3-Wg6KA",
                "version": {
                    "created": "7070099"
                }
            }
        }
    }
}
```

### 전체 가이드 검색

모든 가이드 문서를 조회한다.

```http
GET /guide/_search HTTP/1.1
Host: https://search-icomsys-es-5kemlufqgohnofq7x7bqoccxia.ap-northeast-2.es.amazonaws.com
Content-Type: application/json

Request

{
    "query": {
        "match_all": {}
    }
}

Response

{
    "took": 6,
    "timed_out": false,
    "_shards": {
        "total": 2,
        "successful": 2,
        "skipped": 0,
        "failed": 0
    },
    "hits": {
        "total": {
            "value": 5,
            "relation": "eq"
        },
        "max_score": 1.0,
        "hits": [
            {
                "_index": "guide",
                "_type": "_doc",
                "_id": "1",
                "_score": 1.0,
                "_source": {
                    "title": "요금정책",
                    "content": "https://s3.ap-northeast-2.amazonaws.com/icomsys.vm/ex_cost.png"
                }
            },
            {
                "_index": "guide",
                "_type": "_doc",
                "_id": "2",
                "_score": 1.0,
                "_source": {
                    "title": "이달의이벤트",
                    "content": "https://s3.ap-northeast-2.amazonaws.com/icomsys.vm/ex_event.png"
                }
            },
            {
                "_index": "guide",
                "_type": "_doc",
                "_id": "3",
                "_score": 1.0,
                "_source": {
                    "title": "소비자보호규정",
                    "content": "https://s3.ap-northeast-2.amazonaws.com/icomsys.vm/ex_customer.png"
                }
            },
            {
                "_index": "guide",
                "_type": "_doc",
                "_id": "5",
                "_score": 1.0,
                "_source": {
                    "title": "약정할인기준",
                    "content": "https://s3.ap-northeast-2.amazonaws.com/icomsys.vm/ex_sale.png"
                }
            },
            {
                "_index": "guide",
                "_type": "_doc",
                "_id": "4",
                "_score": 1.0,
                "_source": {
                    "title": "부가서비스안내",
                    "content": "https://s3.ap-northeast-2.amazonaws.com/icomsys.vm/ex_service.png"
                }
            }
        ]
    }
}
```

### 가이드 검색 (유사검색)

가이드 문서 중, 해당하는 문서와 일치하는 키워드를 tag 로 랩핑후, `_score` 항목 이 가장 큰 순서로 정렬한다.

```http

GET /guide/_search HTTP/1.1
Host: https://search-icomsys-es-5kemlufqgohnofq7x7bqoccxia.ap-northeast-2.es.amazonaws.com
Content-Type: application/json

Request

{
    "sort": [
        "_score"
    ],
    "query": {
        "match": {
            "title": "요금좀 알려주세요"
        }
    },
    "highlight": {
        "pre_tags": ["<i>"],
        "post_tags": ["</i>"],
        "fields": {
            "*": {}
        }
    }
}
{
    "sort": [
        "_score"
    ],
    "query": {
        "match": {
            "title": "요금좀 알려주세요"
        }
    },
    "highlight": {
        "pre_tags": ["<i>"],
        "post_tags": ["</i>"],
        "fields": {
            "*": {}
        }
    }
}

Response

{
    "took": 54,
    "timed_out": false,
    "_shards": {
        "total": 2,
        "successful": 2,
        "skipped": 0,
        "failed": 0
    },
    "hits": {
        "total": {
            "value": 1,
            "relation": "eq"
        },
        "max_score": 2.1476274,
        "hits": [
            {
                "_index": "guide",
                "_type": "_doc",
                "_id": "1",
                "_score": 2.1476274,
                "_source": {
                    "title": "요금정책",
                    "content": "https://s3.ap-northeast-2.amazonaws.com/icomsys.vm/ex_cost.png"
                },
                "highlight": {
                    "title": [
                        "<i>요금</i>정책"
                    ]
                }
            }
        ]
    }
}
```

#### 형태소 키워드 분석

```http

POST /guide/_analyze HTTP/1.1
Host: https://search-icomsys-es-5kemlufqgohnofq7x7bqoccxia.ap-northeast-2.es.amazonaws.com
Content-Type: application/json

Request

{
    "analyzer": "korean_analyzer",
    "text": "요금정책이 어떻게되나요"
}

Response

{
    "tokens": [
        {
            "token": "요금/N",
            "start_offset": 0,
            "end_offset": 2,
            "type": "N",
            "position": 0
        },
        {
            "token": "얼마/N",
            "start_offset": 0,
            "end_offset": 2,
            "type": "SYNONYM",
            "position": 0
        },
        {
            "token": "비싸/V",
            "start_offset": 0,
            "end_offset": 2,
            "type": "SYNONYM",
            "position": 0
        },
        {
            "token": "정책/N",
            "start_offset": 2,
            "end_offset": 4,
            "type": "N",
            "position": 1
        },
        {
            "token": "정책이/EOJ",
            "start_offset": 2,
            "end_offset": 5,
            "type": "EOJ",
            "position": 1
        },
        {
            "token": "어떻게/M",
            "start_offset": 6,
            "end_offset": 9,
            "type": "M",
            "position": 2
        },
        {
            "token": "되/V",
            "start_offset": 9,
            "end_offset": 10,
            "type": "V",
            "position": 3
        },
        {
            "token": "되나요/EOJ",
            "start_offset": 9,
            "end_offset": 12,
            "type": "EOJ",
            "position": 3
        }
    ]
}
```
