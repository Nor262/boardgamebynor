import crypto from 'crypto';

export interface SessionData {
  sessionToken: string;
  socketId: string;
  roomCode: string;
  playerId: string;
  nickname: string;
  avatarSeed: string;
  lastActive: number;
}

export class SessionManager {
  private sessions = new Map<string, SessionData>();
  private socketToToken = new Map<string, string>();

  createSession(socketId: string, nickname: string, roomCode: string, avatarSeed: string): SessionData {
    const sessionToken = crypto.randomUUID();
    const playerId = 'p_' + crypto.randomBytes(4).toString('hex');
    const session: SessionData = {
      sessionToken,
      socketId,
      roomCode,
      playerId,
      nickname,
      avatarSeed,
      lastActive: Date.now()
    };

    this.sessions.set(sessionToken, session);
    this.socketToToken.set(socketId, sessionToken);
    return session;
  }

  getSession(token: string): SessionData | undefined {
    const session = this.sessions.get(token);
    if (session) {
      session.lastActive = Date.now();
    }
    return session;
  }

  getBySocketId(socketId: string): SessionData | undefined {
    const token = this.socketToToken.get(socketId);
    if (!token) return undefined;
    return this.getSession(token);
  }

  updateSocket(sessionToken: string, newSocketId: string): SessionData | undefined {
    const session = this.sessions.get(sessionToken);
    if (!session) return undefined;

    // Xóa map socket cũ
    this.socketToToken.delete(session.socketId);

    // Cập nhật socket mới
    session.socketId = newSocketId;
    session.lastActive = Date.now();
    this.socketToToken.set(newSocketId, sessionToken);
    return session;
  }

  removeSocket(socketId: string): void {
    this.socketToToken.delete(socketId);
  }

  removeSession(sessionToken: string): void {
    const session = this.sessions.get(sessionToken);
    if (session) {
      this.socketToToken.delete(session.socketId);
      this.sessions.delete(sessionToken);
    }
  }
}
