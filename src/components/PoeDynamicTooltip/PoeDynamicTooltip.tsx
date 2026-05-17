import React from 'react';
import { HoverCard } from '@mantine/core';
import './PoeDynamicTooltip.style.scss';

interface PoeDynamicTooltipProps {
  item: any;
  children: React.ReactNode;
}

export const PoeDynamicTooltip: React.FC<PoeDynamicTooltipProps> = ({ item, children }) => {
  if (!item) return <>{children}</>;

  // Render main characteristics (Level, Mana Cost, Cast Time, Crit, etc.)
  const renderProperties = () => {
    if (!item.properties) return null;
    return (
      <div className="poe-properties">
        {item.properties.map((prop: any, idx: number) => {
          const hasValue = prop.values && prop.values.length > 0;
          const valueText = hasValue ? prop.values[0][0] : '';
          const isAugmented = hasValue && prop.values[0][1] === 1;

          if (prop.displayMode === 3 && hasValue) {
            return (
              <div key={idx} className="poe-prop-row text-center">
                {prop.name.replace('%0', valueText)}
              </div>
            );
          }

          return (
            <div key={idx} className="poe-prop-row">
              <span className="poe-label">{prop.name}</span>
              {hasValue && (
                <>
                  <span className="poe-colon">: </span>
                  <span className={`poe-value ${isAugmented ? 'poe-augmented' : ''}`}>{valueText}</span>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render requirements (Level, Dex, Str, Int)
  const renderRequirements = () => {
    if (!item.requirements || item.requirements.length === 0) return null;
    return (
      <div className="poe-requirements text-center">
        <span className="poe-label">Требуется </span>
        {item.requirements.map((req: any, idx: number) => (
          <span key={idx}>
            <span className="poe-label">{req.name} </span>
            <span className="poe-value">{req.values[0][0]}</span>
            {idx < item.requirements.length - 1 ? <span className="poe-label">, </span> : ''}
          </span>
        ))}
      </div>
    );
  };

  return (
    <HoverCard width={450} shadow="xl" position="right-start" withArrow openDelay={150} closeDelay={100}>
      <HoverCard.Target>
        <span className="poe-tooltip-trigger">{children}</span>
      </HoverCard.Target>
      <HoverCard.Dropdown className="poe-tooltip-dropdown">
        <div className="poe-frame-header">
          <div className="poe-frame-name">{item.typeLine}</div>
          {item.secDescrText && <div className="poe-frame-sec-type">{item.secDescrText}</div>}
        </div>

        <div className="poe-tooltip-separator" />
        {renderProperties()}

        {item.requirements && (
          <>
            <div className="poe-tooltip-separator" />
            {renderRequirements()}
          </>
        )}

        {item.explicitMods && item.explicitMods.length > 0 && (
          <>
            <div className="poe-tooltip-separator" />
            <div className="poe-explicit-mods">
              {item.explicitMods.map((mod: string, idx: number) => (
                <div key={idx} className="poe-mod-line">{mod}</div>
              ))}
            </div>
          </>
        )}

        {item.descrText && (
          <>
            <div className="poe-tooltip-separator" />
            <div className="poe-descr-text">{item.descrText}</div>
          </>
        )}
      </HoverCard.Dropdown>
    </HoverCard>
  );
};

export default PoeDynamicTooltip;
