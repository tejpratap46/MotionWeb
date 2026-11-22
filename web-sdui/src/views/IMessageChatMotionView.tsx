import React from 'react';
import type { MotionViewProps, MotionConfig } from '../infra/types';
import { useApplyEffects } from '../effects/useApplyEffects';
import { getAssetUri } from '../infra/assetUtils';

export const IMessageChatMotionView: React.FC<{
  props: MotionViewProps;
  currentFrame: number;
  config: MotionConfig;
}> = ({ props, currentFrame, config }) => {
  const style = useApplyEffects(props, currentFrame, config);

  const lyrics: Array<{ frame: number; text: string }> = props.lyrics || [];
  const writingSpeed = props.writingSpeed || 1.0;
  const isAlternating = props.isAlternating === true;

  const defaultBubbleColor = props.bubbleColor || '#007AFF';
  const defaultTextColor = props.textColor || '#FFFFFF';
  const incomingBubbleColor = props.incomingBubbleColor || '#26252A';
  const incomingTextColor = props.incomingTextColor || '#FFFFFF';

  const getFontSize = (variant?: string) => {
    switch (variant) {
      case 'H1': return '2.5rem';
      case 'H2': return '2rem';
      case 'H3': return '1.6rem';
      case 'H4': return '1.3rem';
      case 'H5': return '1.05rem';
      case 'H6': return '0.9rem';
      case 'P': return '1rem';
      default: return '1.05rem';
    }
  };

  const fontFamily = props.fontAsset ? getAssetUri(props.fontAsset) : undefined;
  const fontSize = getFontSize(props.textSizeVariant || 'H5');

  // Filter all lyrics arrived up to currentFrame
  const visibleLyrics = lyrics.filter((l) => l.frame <= currentFrame);
  const activeIndex = visibleLyrics.length - 1;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '100px 36px 120px 36px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        gap: '12px',
        maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 6%, black 16%, black 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 6%, black 16%, black 100%)',
        ...style,
      }}
    >
      {visibleLyrics.map((lyric, index) => {
        const isOutgoing = isAlternating ? index % 2 === 0 : true;
        const bubbleBg = isOutgoing ? defaultBubbleColor : incomingBubbleColor;
        const txtColor = isOutgoing ? defaultTextColor : incomingTextColor;

        const words = lyric.text ? lyric.text.split(' ') : [];
        if (words.length === 0) return null;

        let completedWords = words;
        let activeWord = '';
        let activeWordAlpha = 1.0;
        let bubbleAlpha = 1.0;

        if (index === activeIndex) {
          const nextFrame =
            index + 1 < lyrics.length ? lyrics[index + 1].frame : lyric.frame + 60;
          const duration = Math.max(1, nextFrame - lyric.frame);
          const elapsed = Math.max(0, currentFrame - lyric.frame);
          const effectiveSpeed = writingSpeed > 0 ? writingSpeed : 1.0;
          const lineTypingDuration = Math.max(1, duration / effectiveSpeed);
          const lineProgress = Math.min(1, Math.max(0, elapsed / lineTypingDuration));

          const continuousWordIndex = lineProgress * words.length;

          if (lineProgress < 1.0) {
            const activeWordIndex = Math.min(words.length - 1, Math.floor(continuousWordIndex));
            const wordSubProgress = Math.min(1, Math.max(0, continuousWordIndex - activeWordIndex));

            const framesPerWord = lineTypingDuration / words.length;
            const animFrames = Math.max(2, Math.min(6, framesPerWord * 0.75));
            const animDurationFraction = Math.min(0.9, Math.max(0.2, animFrames / framesPerWord));
            const wordAnimT = Math.min(1, Math.max(0, wordSubProgress / animDurationFraction));

            const f = 1 - wordAnimT;
            const easedAnimT = 1 - f * f * f;

            completedWords = words.slice(0, activeWordIndex);
            activeWord = words[activeWordIndex];
            activeWordAlpha = easedAnimT;
            bubbleAlpha = activeWordIndex === 0 ? easedAnimT : 1.0;
          }
        }

        return (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: isOutgoing ? 'flex-end' : 'flex-start',
              width: '100%',
              flexShrink: 0,
              opacity: bubbleAlpha,
              transition: 'opacity 0.15s ease-out, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div
              style={{
                backgroundColor: bubbleBg,
                color: txtColor,
                padding: '10px 16px',
                borderRadius: isOutgoing
                  ? '20px 20px 4px 20px'
                  : '20px 20px 20px 4px',
                maxWidth: '72%',
                width: 'fit-content',
                fontSize: fontSize,
                fontFamily: fontFamily,
                lineHeight: 1.3,
                wordBreak: 'break-word',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1), padding 0.15s ease-out',
              }}
            >
              <span>
                {completedWords.length > 0 && completedWords.join(' ')}
                {activeWord && (
                  <>
                    {completedWords.length > 0 && ' '}
                    <span
                      style={{
                        opacity: activeWordAlpha,
                        display: 'inline-block',
                        transition: 'opacity 0.1s ease-out',
                      }}
                    >
                      {activeWord}
                    </span>
                  </>
                )}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
