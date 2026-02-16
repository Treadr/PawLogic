import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Hook that loads data on screen focus and provides pull-to-refresh state.
 * Extracts the common useFocusEffect + refresh pattern used across screens.
 */
export function useFocusRefresh(loadFn: () => Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadFn();
    }, [loadFn]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFn();
    setRefreshing(false);
  }, [loadFn]);

  return { refreshing, onRefresh };
}
