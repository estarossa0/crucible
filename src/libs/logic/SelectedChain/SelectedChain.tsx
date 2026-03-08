import { Box, Text, useInput } from 'ink';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { OverlayType, useApp } from '@logic/AppContext';
import { type SelectOption } from '@ui/Select';
import { type Chain, chainList } from '@utils/index';

import { ChainSelect } from './ChainSelect';

const allOptions: SelectOption<Chain>[] = chainList.map((c) => ({ label: c, value: c }));

export function SelectedChain() {
  const { chain, enabledOverlay } = useApp();
  const isActive = enabledOverlay === OverlayType.ChainSelect;

  const [filterText, setFilterText] = useState('');
  const [highlightedValue, setHighlightedValue] = useState<Chain>(chain);

  const filteredOptions = useMemo(
    () => allOptions.filter((o) => o.label.toLowerCase().includes(filterText.toLowerCase())),
    [filterText],
  );

  useEffect(() => {
    const first = filteredOptions[0];
    if (first) {
      setHighlightedValue(first.value);
    }
  }, [filteredOptions]);

  useEffect(() => {
    if (isActive) {
      setFilterText('');
      setHighlightedValue(chain);
    }
  }, [isActive, chain]);

  useInput(
    (input, key) => {
      if (key.upArrow || key.downArrow || key.return || key.escape) return;

      if (key.backspace || key.delete) {
        setFilterText((prev) => prev.slice(0, -1));
        return;
      }

      if (key.tab) {
        setFilterText(highlightedValue);
        return;
      }

      if (input && !key.ctrl && !key.meta) {
        setFilterText((prev) => prev + input);
      }
    },
    { isActive },
  );

  const handleChange = useCallback((value: Chain) => {
    setHighlightedValue(value);
  }, []);

  if (!isActive) {
    return <Text color="yellow">{chain}</Text>;
  }

  const highlightedLabel = filteredOptions.find((o) => o.value === highlightedValue)?.label ?? '';
  const startsWithFilter =
    filterText && highlightedLabel.toLowerCase().startsWith(filterText.toLowerCase());
  const remainder = startsWithFilter ? highlightedLabel.slice(filterText.length) : '';

  return (
    <Box flexDirection="column">
      <ChainSelect options={filteredOptions} value={highlightedValue} onChange={handleChange} />
      <Text>
        {filterText ? (
          <>
            <Text color="cyan">{filterText}</Text>
            {!remainder && <Text dimColor>▌</Text>}
            {remainder && (
              <>
                <Text backgroundColor="gray" dimColor>
                  {remainder[0]}
                </Text>
                <Text dimColor>{remainder.slice(1)}</Text>
              </>
            )}
          </>
        ) : (
          <>
            <Text dimColor>▌</Text>
            <Text dimColor>{highlightedLabel}</Text>
          </>
        )}
      </Text>
    </Box>
  );
}
