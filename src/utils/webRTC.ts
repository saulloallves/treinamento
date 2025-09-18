// WebRTC utilities for live streaming
export interface StreamParticipant {
  id: string;
  name: string;
  stream?: MediaStream;
  peerConnection?: RTCPeerConnection;
  isInstructor: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
}

export interface StreamMessage {
  type: 'join' | 'leave' | 'offer' | 'answer' | 'ice-candidate' | 'toggle-audio' | 'toggle-video' | 'chat';
  participantId: string;
  data?: any;
  roomId?: string;
}

export class WebRTCManager {
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private participants: Map<string, StreamParticipant> = new Map();
  private roomId: string;
  private localParticipantId: string;
  private onParticipantUpdate?: (participants: StreamParticipant[]) => void;
  private onChatMessage?: (message: any) => void;

  constructor(
    roomId: string, 
    localParticipantId: string,
    onParticipantUpdate?: (participants: StreamParticipant[]) => void,
    onChatMessage?: (message: any) => void
  ) {
    this.roomId = roomId;
    this.localParticipantId = localParticipantId;
    this.onParticipantUpdate = onParticipantUpdate;
    this.onChatMessage = onChatMessage;
  }

  async initializeLocalStream(audio = true, video = true): Promise<MediaStream | null> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio,
        video: video ? { width: 1280, height: 720 } : false
      });
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      return null;
    }
  }

  async startScreenShare(): Promise<MediaStream | null> {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      return this.screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      return null;
    }
  }

  stopScreenShare() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }
  }

  async createPeerConnection(participantId: string): Promise<RTCPeerConnection> {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Handle incoming streams
    peerConnection.ontrack = (event) => {
      const participant = this.participants.get(participantId);
      if (participant) {
        participant.stream = event.streams[0];
        this.updateParticipants();
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: 'ice-candidate',
          participantId: this.localParticipantId,
          data: event.candidate,
          roomId: this.roomId
        });
      }
    };

    return peerConnection;
  }

  toggleAudio(enabled: boolean) {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
      }
    }
    this.sendSignalingMessage({
      type: 'toggle-audio',
      participantId: this.localParticipantId,
      data: { enabled },
      roomId: this.roomId
    });
  }

  toggleVideo(enabled: boolean) {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
      }
    }
    this.sendSignalingMessage({
      type: 'toggle-video',
      participantId: this.localParticipantId,
      data: { enabled },
      roomId: this.roomId
    });
  }

  sendChatMessage(message: string) {
    this.sendSignalingMessage({
      type: 'chat',
      participantId: this.localParticipantId,
      data: { message, timestamp: new Date().toISOString() },
      roomId: this.roomId
    });
  }

  private sendSignalingMessage(message: StreamMessage) {
    // This will be implemented with Supabase Realtime
    console.log('Sending signaling message:', message);
  }

  private updateParticipants() {
    if (this.onParticipantUpdate) {
      this.onParticipantUpdate(Array.from(this.participants.values()));
    }
  }

  addParticipant(participant: StreamParticipant) {
    this.participants.set(participant.id, participant);
    this.updateParticipants();
  }

  removeParticipant(participantId: string) {
    const participant = this.participants.get(participantId);
    if (participant?.peerConnection) {
      participant.peerConnection.close();
    }
    this.participants.delete(participantId);
    this.updateParticipants();
  }

  cleanup() {
    // Close all peer connections
    this.participants.forEach(participant => {
      participant.peerConnection?.close();
    });

    // Stop local streams
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
    }

    this.participants.clear();
  }
}

export const createWebRTCManager = (
  roomId: string,
  participantId: string,
  onParticipantUpdate?: (participants: StreamParticipant[]) => void,
  onChatMessage?: (message: any) => void
) => {
  return new WebRTCManager(roomId, participantId, onParticipantUpdate, onChatMessage);
};