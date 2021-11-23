# 負荷かけた場合の挙動

## コマンド
#### 負荷実行
`npx artillery run socketio_senario.yml`
#### TCPコネクション数確認
`watch "netstat -anp tcp | wc -l"`


## 実行結果

### 1百リクエスト
問題なし
```yml
config:
  target: "http://172.28.32.204:3000"
  phases:
    - duration: 1
      arrivalRate: 100
scenarios:
  - engine: "socketio"
    flow:
      - get:
          url: "/viewer"
      - think: 100
```


### 1千リクエスト
ギリギリ問題なし
更新時に一度接続が切れる(disconnect)が再度接続する挙動になった
```yml
config:
  target: "http://172.28.32.204:3000"
  phases:
    - duration: 10
      arrivalRate: 100
scenarios:
  - engine: "socketio"
    flow:
      - get:
          url: "/viewer"
      - think: 10000
```
### 5千リクエスト
問題あり
タイムアウト発生
``` yml
config:
  target: "http://172.28.32.204:3000"
  phases:
    - duration: 50
      arrivalRate: 100
scenarios:
  - engine: "socketio"
    flow:
      - get:
          url: "/viewer"
      - think: 10000

```

### 1万
```yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 100
      arrivalRate: 100
scenarios:
  - engine: "socketio"
    flow:
      - get:
          url: "/viewer"
      - emit:
          channel: "checkDomVersion"
          data: 3
        response:
          channel: "latestHtml"
          capture:
            json: "$"
            as: "data"
      - think: 200
      # - log: "Emitting captured values: {{ data }}"

```
```
http.request_rate: .......................................... 23/sec
socketio.emit_rate: ......................................... 15/sec
http.requests: .............................................. 6292
http.codes.200: ............................................. 4563
http.responses: ............................................. 4563
socketio.emit: .............................................. 4563
http.response_time:
  min: ...................................................... 0
  max: ...................................................... 8357
  median: ................................................... 2369
  p95: ...................................................... 3752.7
  p99: ...................................................... 5065.6
socketio.response_time:
  min: ...................................................... 9.3
  max: ...................................................... 8605.5
  median: ................................................... 742.6
  p95: ...................................................... 1620
  p99: ...................................................... 2276.1
errors.ETIMEDOUT: ........................................... 1729
errors.Error: xhr poll error: ............................... 24
errors.Error: xhr post error: ............................... 34
errors.Error: timeout: ...................................... 3651
errors.response timeout: .................................... 75
```
---
テスト
## socket_index
問題なし
```yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 100
      arrivalRate: 100
scenarios:
  - engine: "socketio"
    flow:
      - get:
          url: "/viewer"
      - think: 200
```