import { SessionProvider, RoomAudioRenderer } from '@livekit/components-react';

/**
 * A provider component for agent sessions that wraps SessionProvider
 * and includes RoomAudioRenderer for audio playback.
 *
 * @example
 * ```tsx
 * <AgentSessionProvider session={agentSession}>
 *   <AgentControlBar />
 *   <AgentChatTranscript />
 * </AgentSessionProvider>
 * ```
 */
export function AgentSessionProvider({
 session,
 children,
 ...roomAudioRendererProps
}) {
  return (
    <SessionProvider session={session}>
      {children}
      <RoomAudioRenderer {...roomAudioRendererProps} />
    </SessionProvider>
  );
}
