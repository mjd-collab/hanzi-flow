export interface HanziChar {
  id: string;
  char: string;
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  PLAYING = 'PLAYING',
}

// Minimal type definition for HanziWriter since we might not have the d.ts installed in this environment
export interface HanziWriterOptions {
  width?: number;
  height?: number;
  padding?: number;
  strokeColor?: string;
  radicalColor?: string;
  showOutline?: boolean;
  strokeAnimationSpeed?: number;
  delayBetweenStrokes?: number;
  delayBetweenLoops?: number;
  showCharacter?: boolean;
  showHintAfterMisses?: number;
  highlightColor?: string; 
}

export interface HanziWriterInstance {
  animateCharacter(options?: { onComplete?: () => void }): void;
  loopCharacterAnimation(): void;
  showCharacter(): void;
  hideCharacter(): void;
  quiz(options?: any): void;
  cancelQuiz(): void;
  setCharacter(char: string): void;
}