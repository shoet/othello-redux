import { Connection } from "../domain/types";

interface IConnectionRepository {
  saveConnection(connection: Connection): Promise<void>;
}

export class ConnectionUsecase {
  constructor(private connectionRepository: IConnectionRepository) {}

  async run(connectionID: string): Promise<string> {
    const clientID = crypto.randomUUID();
    await this.connectionRepository.saveConnection({ clientID, connectionID });
    return clientID;
  }
}
