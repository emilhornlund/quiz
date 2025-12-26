export enum GameStatus {
  Active = 'ACTIVE',
  Completed = 'COMPLETED',
  Expired = 'EXPIRED',

  /**
   * The game was ended early by the host.
   */
  Terminated = 'TERMINATED',
}
