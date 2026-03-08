import { useStdout } from 'ink';
import { useEffect, useState } from 'react';

export function useTerminalSize() {
  const { stdout } = useStdout();
  const [size, setSize] = useState({
    width: stdout?.columns ?? 80,
    height: stdout?.rows ?? 24,
  });

  useEffect(() => {
    if (!stdout) return;

    const onResize = () => {
      setSize({ width: stdout.columns, height: stdout.rows });
    };

    stdout.on('resize', onResize);
    return () => {
      stdout.off('resize', onResize);
    };
  }, [stdout]);

  return size;
}
