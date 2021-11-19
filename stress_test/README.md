##  コマンド
npx artillery run socketio_senario.yml

問題なし、0->1の挿入削除も大丈夫
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

問題あり、最後の方にタイムアウトが出る
```yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 1000
      arrivalRate: 100
scenarios:
  - engine: "socketio"
    flow:
      - get:
          url: "/viewer"
      - think: 200
```
3->6
問題あり タイムアウト発生
改良後、問題なし
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