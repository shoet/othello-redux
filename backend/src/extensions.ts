declare global {
  interface Date {
    toTimestampInSeconds(): number;
  }
}

Date.prototype.toTimestampInSeconds = function (): number {
  return Math.floor(this.getTime() / 1000);
};

export {};
