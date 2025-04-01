# ルーティングの設計

```
.
└── Home - ホーム/
    ├── Room - 部屋の一覧/
    │   └── table
    └── (othelloセグメント) /
        ├── layout.tsx/
        │   └── [WebSocketProvider]
        ├── EntryPage - 入室ページ/
        │   └── EntryForm/
        │       ├── input ClientID
        │       ├── input RoomID
        │       └── button Submit
        └── OthelloPage - オセロゲームページ/
            └── [OthelloProvider]/
                ├── Header
                └── Board
```
