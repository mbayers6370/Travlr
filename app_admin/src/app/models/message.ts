export type MessageKind = 'trip' | 'room' | 'contact';

export interface Message {
  _id: string;
  kind: MessageKind;
  subject: string;
  tripCode?: string;
  tripName?: string;
  roomName?: string;
  name: string;
  email: string;
  travelers?: number;
  preferredDate?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
