import { AgentAudioVisualizerAura } from '../../components/agent-audio-visualizer-aura';
import { useRoom } from '../../context/RoomContext';

function LiveKitAvatar({ state = 'idle', size = 'md', className = '' }) {
  const { localAudioTrack } = useRoom();

  return (
    <div className="flex h-full min-h-[220px] w-full items-center justify-center p-6">
      <div className="flex h-40 w-40 items-center justify-center overflow-visible">
        <AgentAudioVisualizerAura
          state={state}
          audioTrack={localAudioTrack}
          size={size}
          color="#4A7FF8"
          className={`h-36 w-36 ${className}`}
        />
      </div>
    </div>
  );
}

export default LiveKitAvatar;