import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StreamMessage {
  type: 'join' | 'leave' | 'offer' | 'answer' | 'ice-candidate' | 'toggle-audio' | 'toggle-video' | 'chat';
  participantId: string;
  data?: any;
  roomId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { message } = await req.json() as { message: StreamMessage };
    
    console.log('Processing signaling message:', message);

    // Handle different message types
    switch (message.type) {
      case 'join':
        await handleJoinRoom(supabaseClient, message);
        break;
      
      case 'leave':
        await handleLeaveRoom(supabaseClient, message);
        break;
      
      case 'offer':
      case 'answer':
      case 'ice-candidate':
        await relaySignalingMessage(supabaseClient, message);
        break;
      
      case 'toggle-audio':
      case 'toggle-video':
        await updateParticipantStatus(supabaseClient, message);
        break;
      
      case 'chat':
        await handleChatMessage(supabaseClient, message);
        break;
      
      default:
        console.log('Unknown message type:', message.type);
    }

    return new Response(
      JSON.stringify({ success: true }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing signaling message:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleJoinRoom(supabaseClient: any, message: StreamMessage) {
  console.log('Participant joining room:', message.participantId, message.roomId);
  
  // Update participant status to connected
  const { error } = await supabaseClient
    .from('live_participants')
    .update({ 
      status: 'connected',
      joined_at: new Date().toISOString()
    })
    .eq('lesson_id', message.roomId)
    .eq('user_id', message.participantId);

  if (error) {
    console.error('Error updating participant status:', error);
  }

  // Notify other participants via Realtime
  await supabaseClient
    .channel(`stream-${message.roomId}`)
    .send({
      type: 'broadcast',
      event: 'participant-joined',
      payload: { participantId: message.participantId }
    });
}

async function handleLeaveRoom(supabaseClient: any, message: StreamMessage) {
  console.log('Participant leaving room:', message.participantId, message.roomId);
  
  // Update participant status to disconnected
  const { error } = await supabaseClient
    .from('live_participants')
    .update({ 
      status: 'disconnected',
      left_at: new Date().toISOString()
    })
    .eq('lesson_id', message.roomId)
    .eq('user_id', message.participantId);

  if (error) {
    console.error('Error updating participant leave status:', error);
  }

  // Notify other participants via Realtime
  await supabaseClient
    .channel(`stream-${message.roomId}`)
    .send({
      type: 'broadcast',
      event: 'participant-left',
      payload: { participantId: message.participantId }
    });
}

async function relaySignalingMessage(supabaseClient: any, message: StreamMessage) {
  console.log('Relaying signaling message:', message.type);
  
  // Broadcast WebRTC signaling messages to all participants in the room
  await supabaseClient
    .channel(`stream-${message.roomId}`)
    .send({
      type: 'broadcast',
      event: 'webrtc-signal',
      payload: {
        type: message.type,
        participantId: message.participantId,
        data: message.data
      }
    });
}

async function updateParticipantStatus(supabaseClient: any, message: StreamMessage) {
  console.log('Updating participant status:', message.type, message.data);
  
  const updateData: any = {};
  
  if (message.type === 'toggle-audio') {
    updateData.audio_enabled = message.data.enabled;
  } else if (message.type === 'toggle-video') {
    updateData.video_enabled = message.data.enabled;
  }

  // Update participant status in database
  const { error } = await supabaseClient
    .from('live_participants')
    .update(updateData)
    .eq('lesson_id', message.roomId)
    .eq('user_id', message.participantId);

  if (error) {
    console.error('Error updating participant media status:', error);
  }

  // Notify other participants
  await supabaseClient
    .channel(`stream-${message.roomId}`)
    .send({
      type: 'broadcast',
      event: 'participant-updated',
      payload: {
        participantId: message.participantId,
        type: message.type,
        data: message.data
      }
    });
}

async function handleChatMessage(supabaseClient: any, message: StreamMessage) {
  console.log('Broadcasting chat message from:', message.participantId);
  
  // Get participant name
  const { data: participant } = await supabaseClient
    .from('live_participants')
    .select('user_name')
    .eq('lesson_id', message.roomId)
    .eq('user_id', message.participantId)
    .single();

  // Broadcast chat message to all participants
  await supabaseClient
    .channel(`stream-${message.roomId}`)
    .send({
      type: 'broadcast',
      event: 'chat-message',
      payload: {
        participantId: message.participantId,
        participantName: participant?.user_name || 'Participante',
        message: message.data.message,
        timestamp: message.data.timestamp
      }
    });
}