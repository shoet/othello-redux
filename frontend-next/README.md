# ルーティングの設計

```
.
└── Home - ホーム/
    ├── Room - 部屋の一覧/
    │   └── table
    └── (othelloセグメント) /
        ├── layout.tsx/
        │   └── [WebSocketContextProvider]/ - WebSocketのconnectionを保持・APIを提供
        │       └── [OthelloContextProvider]/ - オセロゲームの状態を保持・APIを提供
        │           └── [ReceiveWebSocketMessageContainer] - WebSocketの受信メッセージを受け取った際のロジックを定義
        ├── EntryPage - 入室ページ/
        │   └── EntryForm/ - useContextからAPIを実行
        │       ├── input ClientID
        │       ├── input RoomID
        │       └── button Submit
        └── OthelloPage - オセロゲームページ/
            └── [OthelloProvider]/
                ├── Header
                └── Board
```
