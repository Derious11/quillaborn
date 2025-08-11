'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface AvatarSelectorProps {
  currentAvatarKey?: string | null;
  onSelect: (avatarKey: string) => void;
  isLoading?: boolean;
}

// List of available preset avatars
const PRESET_AVATARS = [
  'qb-avatar-01-fox.svg',
  'qb-avatar-02-cat.svg',
  'qb-avatar-03-robot.svg',
  'qb-avatar-04-owl.svg',
  'qb-avatar-05-bear.svg',
  'qb-avatar-06-dog.svg',
  'qb-avatar-07-rabbit.svg',
  'qb-avatar-08-frog.svg',
  'qb-avatar-09-turtle.svg',
  'qb-avatar-10-tiger.svg',
  'qb-avatar-11-panda.svg',
  'qb-avatar-12-unicorn.svg',
  'qb-avatar-13-phoenix.svg',
  'qb-avatar-14-koala.svg',
  'qb-avatar-15-octopus.svg',
  'qb-avatar-16-wolf.svg',
  'qb-avatar-17-alien.svg',
  'qb-avatar-18-quill.svg',
  'qb-avatar-19-dragon.svg',
  'qb-avatar-20-penguin.svg',
];

function getAvatarDisplayName(filename: string): string {
  return filename
    .replace('qb-avatar-', '')
    .replace('.svg', '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function AvatarSelector({ currentAvatarKey, onSelect, isLoading }: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatarKey || null);

  const handleAvatarClick = (avatarKey: string) => {
    setSelectedAvatar(avatarKey);
  };

  const handleConfirmSelection = () => {
    if (selectedAvatar) {
      onSelect(selectedAvatar);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Avatar</h2>
        <p className="text-muted-foreground">
          Select a preset avatar to represent your profile
        </p>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {PRESET_AVATARS.map((avatar) => (
          <Card
            key={avatar}
            className={`cursor-pointer transition-all hover:scale-105 ${
              selectedAvatar === avatar
                ? 'ring-2 ring-primary ring-offset-2'
                : 'hover:shadow-md'
            }`}
            onClick={() => handleAvatarClick(avatar)}
          >
            <CardContent className="p-3 relative">
              <div className="aspect-square relative">
                <Image
                  src={`/avatars/presets/${avatar}`}
                  alt={getAvatarDisplayName(avatar)}
                  fill
                  className="object-contain"
                />
                {selectedAvatar === avatar && (
                  <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                    <Check size={12} />
                  </div>
                )}
              </div>
              <p className="text-xs text-center mt-2 text-muted-foreground">
                {getAvatarDisplayName(avatar)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedAvatar && (
        <div className="flex justify-center">
          <Button
            onClick={handleConfirmSelection}
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? 'Updating...' : 'Confirm Selection'}
          </Button>
        </div>
      )}
    </div>
  );
}
