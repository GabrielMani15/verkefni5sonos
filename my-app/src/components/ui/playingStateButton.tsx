import useDevice from "@/app/libs/useDevice"

export default function PlayingStateButton() {
    return (
        <button 
            onClick={togglePlayPause} 
            disabled={loading}
            className={`p-4 rounded-full ${isPlaying ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {loading ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}
        </button>
    )
}