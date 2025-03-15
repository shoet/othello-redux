export class UsecaseError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.name = new.target.name; // クラス名をエラーの名前として設定
    this.code = code;
  }
}
