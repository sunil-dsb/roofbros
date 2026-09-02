import { eq, and } from 'drizzle-orm';
import { db } from '../../config/db.ts';
import {
  tileType,
  tileProfile,
  tileColor,
  tileProfileColor,
} from '../../db/schema/tile.schema.ts';

// Removed DUMMY_IMAGE as client prefers null when no image exists
export const getTilesService = async () => {
  const tiles = await db.select().from(tileType);
  return tiles;
};

export const getProfilesByTileIdService = async (
  tileId: string,
  profileType?: string,
) => {
  const profiles = await db
    .select()
    .from(tileProfile)
    .where(
      and(
        eq(tileProfile.tileTypeId, tileId),
        profileType
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            eq(tileProfile.profileType, profileType as any)
          : undefined,
      ),
    );

  return profiles;
};

export const getColorsService = async (profileId?: string) => {
  if (profileId) {
    // Return colors associated with a specific profile
    const profileColors = await db
      .select({
        id: tileColor.id,
        name: tileColor.name,
        hexCode: tileColor.hexCode,
        imageUrl: tileColor.imageUrl, // Get the color's image
        profileImageUrl: tileProfileColor.imageUrl, // Get the profile-specific image if any
      })
      .from(tileProfileColor)
      .innerJoin(tileColor, eq(tileProfileColor.colorId, tileColor.id))
      .where(eq(tileProfileColor.profileId, profileId));

    return profileColors.map((c) => ({
      id: c.id,
      name: c.name,
      hexCode: c.hexCode,
      imageUrl: c.profileImageUrl || c.imageUrl || null,
    }));
  }

  // Return all colors
  const colors = await db.select().from(tileColor);
  return colors.map((c) => ({ ...c, imageUrl: c.imageUrl || null }));
};
