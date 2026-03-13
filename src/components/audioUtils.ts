export function crossfade(
  audioOut: HTMLAudioElement | null,
  audioIn: HTMLAudioElement | null,
  durationMs: number = 2000,
  targetVolumeIn: number = 1.0
): () => void {
  const noop = () => {};
  if (!audioOut && !audioIn) return noop;

  const steps = 20;
  const stepTime = durationMs / steps;
  
  // Starting volumes
  const startVolOut = audioOut ? audioOut.volume : 0;
  // If audioIn was already playing, we start from its current volume, otherwise 0
  const startVolIn = audioIn && !audioIn.paused ? audioIn.volume : 0;

  // Amount to change per step
  const volStepOut = startVolOut / steps;
  const volStepIn = (targetVolumeIn - startVolIn) / steps;

  if (audioIn) {
    audioIn.volume = startVolIn;
    // Only play if it was paused
    if (audioIn.paused) {
      audioIn.play().catch(() => {});
    }
  }

  let currentStep = 0;

  const fadeInterval = setInterval(() => {
    currentStep++;
    
    // Decrement out audio
    if (audioOut) {
      const newVol = Math.max(0, startVolOut - volStepOut * currentStep);
      audioOut.volume = newVol;
      if (currentStep >= steps) {
        audioOut.pause();
        audioOut.currentTime = 0;
      }
    }

    // Increment in audio
    if (audioIn) {
      let newVol = startVolIn + volStepIn * currentStep;
      if (currentStep >= steps) newVol = targetVolumeIn;
      audioIn.volume = Math.max(0, Math.min(1, newVol));
    }

    if (currentStep >= steps) {
      clearInterval(fadeInterval);
    }
  }, stepTime);

  // Return a cleanup function in case we need to abort the fade early
  return () => {
    clearInterval(fadeInterval);
  };
}
