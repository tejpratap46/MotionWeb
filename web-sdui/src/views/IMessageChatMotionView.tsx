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
        ...style,
      }}
    >
      {visibleLyrics.map((lyric, index) => {
        const isOutgoing = isAlternating ? index % 2 === 0 : true;
        const bubbleBg = isOutgoing ? defaultBubbleColor : incomingBubbleColor;
        const txtColor = isOutgoing ? defaultTextColor : incomingTextColor;

        let visibleText = lyric.text;

        if (index === activeIndex) {
          const nextFrame =
            index + 1 < lyrics.length ? lyrics[index + 1].frame : lyric.frame + 60;
          const duration = Math.max(1, nextFrame - lyric.frame);
          const elapsed = Math.max(0, currentFrame - lyric.frame);
          const progress = Math.min(1, (elapsed * writingSpeed) / duration);

          const words = lyric.text.split(' ');
          const visibleWordCount = Math.floor(progress * words.length);
          if (visibleWordCount === 0) return null;

          visibleText = words.slice(0, visibleWordCount).join(' ');
        }

        return (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: isOutgoing ? 'flex-end' : 'flex-start',
              width: '100%',
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
                transition: 'width 0.1s ease-out',
              }}
            >
              <span>{visibleText}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
