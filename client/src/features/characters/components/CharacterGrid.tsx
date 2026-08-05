import type { EnrichedCharacter } from '../types/swapi';
import { CharacterCard } from './CharacterCard';
import { CharacterCardSkeleton } from './CharacterCardSkeleton';

interface CharacterGridProps {
  characters: EnrichedCharacter[];
  isLoading: boolean;
  onOpen: (character: EnrichedCharacter, trigger: HTMLButtonElement) => void;
}

export function CharacterGrid({ characters, isLoading, onOpen }: CharacterGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <CharacterCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {characters.map((character) => (
        <CharacterCard key={character.person.url} character={character} onOpen={onOpen} />
      ))}
    </div>
  );
}
