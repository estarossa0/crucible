import { OverlayType, useApp } from '@logic/AppContext';
import { Select, type SelectOption } from '@ui/Select';
import { type Chain } from '@utils/index';

interface ChainSelectProps {
  options: SelectOption<Chain>[];
  value: Chain;
  onChange: (value: Chain) => void;
}

export function ChainSelect({ options, value, onChange }: ChainSelectProps) {
  const { enabledOverlay, setChain, closeOverlay } = useApp();

  if (enabledOverlay !== OverlayType.ChainSelect) return null;

  return (
    <Select
      minWidth={20}
      position="absolute"
      backgroundColor="black"
      bottom={2}
      borderColor="white"
      borderStyle="round"
      options={options}
      value={value}
      onChange={onChange}
      onConfirm={(v) => {
        setChain(v);
        closeOverlay();
      }}
      onCancel={closeOverlay}
    />
  );
}
