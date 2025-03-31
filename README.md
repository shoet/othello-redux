# シーケンス図

```mermaid
sequenceDiagram

participant FRONT
participant HTTPAPI
participant WebSocketAPI
participant WebSocketAPI@connection
participant DB

note over FRONT, DB: Playerが部屋に入る
FRONT->>WebSocketAPI: connection
WebSocketAPI->>WebSocketAPI: ClientID生成
WebSocketAPI->>DB: ConnectionTable: Put { client_id: 1234, connection_id: xxx }
WebSocketAPI-->>FRONT: update_profile { client_id: 1234 }
FRONT->>HTTPAPI: [HTTP] join_room { client_id: 1234, room_id: 1 }
HTTPAPI->>HTTPAPI: ルームが2名以下かチェック
HTTPAPI->>DB: RoomTable: Put { client_id: 1234, room_id: 1 }
HTTPAPI->>WebSocketAPI@connection: system_message を通知する
WebSocketAPI@connection-->>FRONT: [WebSocket] system_message { message: "xxさんが入室しました。" }

note over FRONT, DB: ゲーム開始準備
FRONT->>HTTPAPI: [HTTP] start_game
HTTPAPI->>DB: ボードを用意する
HTTPAPI->>DB: ボードと部屋を紐づける
HTTPAPI->>WebSocketAPI@connection: ゲーム開始を通知する
WebSocketAPI@connection-->>FRONT: [WebSocket] start_game { board, players, turn }

note over FRONT, DB: ゲーム開始後
FRONT->>FRONT: 石を置く
FRONT->>WebSocketAPI:  operation { operation_type: xx, data: { position: { x: x, y: x, color: x } }
WebSocketAPI->>DB: BoardTable Get { room_id: 1234 }
DB-->>WebSocketAPI: [ [ { color: xxx } ] ]
WebSocketAPI->>WebSocketAPI: 石を配置、裏返し処理
WebSocketAPI->>DB: BoardTable Put [ [ { color: xxx } ] ]
WebSocketAPI->>DB: BoardHistoryTable Put { board_id, timestamp, position, color }
WebSocketAPI->>WebSocketAPI: 勝ち負け判定、スコアリング
WebSocketAPI->>WebSocketAPI@connection: ボードの情報、あるいは、勝ち負け情報 を通知
WebSocketAPI@connection-->>FRONT: operation { operation_type: xx, data: {  } }
FRONT->>FRONT: ボードやスコアの描画
```
