import { Room } from "../domain/room";
import { ClientID, Connection, RoomID } from "../domain/types";
import { UsecaseError } from "./error";

interface IRoomRepository {
  isExistRoom(roomID: string): Promise<boolean>;
  createRoom(roomID: string, roomName: string): Promise<void>;
  saveUser(
    roomID: string,
    clientID: ClientID,
    options?: { isCPU: boolean }
  ): Promise<void>;
  getRoom(roomID: RoomID): Promise<Room | undefined>;
}

interface IWebSocketAPIAdapter {
  sendMessage(connectionID: string, message: string): Promise<void>;
  createUpdateProfilePayload(clientID: string, roomID: string): string;
  createSendSystemMessagePayload(message: string): string;
}
interface IConnectionRepository {
  getConnection(clientID: string): Promise<Connection | undefined>;
}

export class JoinRoomUsecase {
  private readonly webSocketAPIAdapter: IWebSocketAPIAdapter;
  private readonly connectionRepository: IConnectionRepository;
  private readonly roomRepository: IRoomRepository;
  constructor(
    webSocketAPIAdapter: IWebSocketAPIAdapter,
    connectionRepository: IConnectionRepository,
    roomRepository: IRoomRepository
  ) {
    this.webSocketAPIAdapter = webSocketAPIAdapter;
    this.connectionRepository = connectionRepository;
    this.roomRepository = roomRepository;
  }

  async run(clientID: ClientID, roomID: RoomID, options?: { vsCPU?: boolean }) {
    // 接続情報取得
    const connection = await this.connectionRepository.getConnection(clientID);
    if (!connection) {
      throw new UsecaseError("connection not found", 404);
    }

    // ルームがなければ作成
    if (!(await this.roomRepository.isExistRoom(roomID))) {
      await this.roomRepository.createRoom(roomID, roomID);
    }

    // ルーム情報を保存
    await this.roomRepository.saveUser(roomID, clientID);
    if (options?.vsCPU) {
      // CPU対戦の場合、CPUプレイヤーを登録する
      const cpuPlayerID = crypto.randomUUID();
      await this.roomRepository.saveUser(roomID, cpuPlayerID, { isCPU: true });
    }

    // ルーム情報を取得
    const room = await this.roomRepository.getRoom(roomID);
    if (!room) {
      throw new UsecaseError("room not found", 404);
    }

    const payload = this.webSocketAPIAdapter.createUpdateProfilePayload(
      clientID,
      roomID
    );
    let message = `${clientID}さんが入室しました。`;
    if (options?.vsCPU) {
      message = "CPUが入室しました";
    }
    await Promise.all([
      // ユーザー情報更新
      this.webSocketAPIAdapter.sendMessage(connection.connectionID, payload),
      // ルーム全員にsystem_message送信
      this.sendSystemMessageToRoom(room, message),
    ]);
    return roomID;
  }

  private async sendSystemMessageToRoom(
    room: Room,
    message: string
  ): Promise<void> {
    const payload =
      this.webSocketAPIAdapter.createSendSystemMessagePayload(message);
    await Promise.all([
      room.players.map(async (player) => {
        if (player.clientID === room.cpuID) {
          // CPUプレイヤーの場合は送信しない
          return;
        }
        const conn = await this.connectionRepository.getConnection(
          player.clientID
        );
        if (!conn) return await Promise.resolve();
        return await this.webSocketAPIAdapter
          .sendMessage(conn.connectionID, payload)
          .catch(async (e) => {
            console.log("connection disconnected", {
              clientID: conn.clientID,
              error: e,
            });
          });
      }),
    ]);
  }
}
