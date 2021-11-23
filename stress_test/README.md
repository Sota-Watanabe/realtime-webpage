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
      - think: 200
```
問題なし