export interface Castle {
  castle_id: string;
  castle_name: string;
}

export interface EventData {
  event_id: string;
  event_name: string;
  castle_name: string;
  event_description: string;
  event_start_date: string;
  event_end_date: string;
  event_start_time: string;
  event_end_time: string;
  castle_id: string;
  castle?: Castle;
}

export interface ApiResponse {
  total: number;
  items: EventData[];
}

export interface CastleResponse {
  castle_id: number;
  castle_name: string;
}

export type CastleArray = CastleResponse[];

export interface UpdateEventPayload {
  event_name: string;
  event_description: string;
  event_start_date: string;
  event_end_date: string;
  event_start_time?: string;
  event_end_time?: string;
  castle_id: number;
}
