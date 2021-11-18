# コマンド
npx artillery run socketio_senario.yml 

# socket_index
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


# index
問題なし、挿入削除も大丈夫
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