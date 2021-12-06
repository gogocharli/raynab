import useSWR, { KeyedMutator } from 'swr';

export function useSharedState<T>(key: string, initial: T): [T | undefined, KeyedMutator<T>] {
  const { data: state, mutate: setState } = useSWR<T>(key, null, {
    fallbackData: initial,
  });
  return [state, setState];
}
