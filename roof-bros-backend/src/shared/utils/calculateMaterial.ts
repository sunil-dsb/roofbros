export type TileProfileName = 'Marseille' | 'Elabana' | string;

export type PrimerType =
  | 'High Build Primer'
  | 'WB Sealer'
  | 'Terracotta Primer'
  | 'Metal Primer'
  | 'None';

// Packaging constraints — tiles per sqm and full row (pallet) size
export const TILE_CONSTRAINTS: Record<
  string,
  { tilesPerSqm: number; fullRowSize: number }
> = {
  Marseille: {
    tilesPerSqm: 12.5,
    fullRowSize: 56,
  },
  Elabana: {
    tilesPerSqm: 10.8,
    fullRowSize: 100,
  },
};

/**
 * Determine the primer type based on tile material and job type.
 */
export const getPrimerType = (
  tileTypeName: string = '',
  jobType: string = '',
): PrimerType => {
  const mat = tileTypeName.toLowerCase();
  const job = jobType.toLowerCase();

  if (mat.includes('metal')) return 'Metal Primer';
  if (mat.includes('terracotta')) return 'Terracotta Primer';
  if (mat.includes('concrete')) {
    if (job.includes('restoration')) return 'High Build Primer';
    // Reroof or New Roof Installation → WB Sealer
    return 'WB Sealer';
  }

  // Tile (generic) defaults to WB Sealer
  return 'WB Sealer';
};

/**
 * Calculate the total number of tiles needed based on packaging constraints.
 * Formula: Math.ceil(areaSqm * tilesPerSqm / fullRowSize) * fullRowSize
 */
export const calculateTiles = (
  areaSqm: number,
  profileName: TileProfileName,
): number => {
  const profile = TILE_CONSTRAINTS[profileName];
  if (!profile) {
    // Fallback: 10 tiles per sqm if profile is unknown
    return Math.ceil(areaSqm * 10);
  }

  const { tilesPerSqm, fullRowSize } = profile;
  const totalBaseTiles = areaSqm * tilesPerSqm;
  // Round up to the nearest full row
  return Math.ceil(totalBaseTiles / fullRowSize) * fullRowSize;
};

/**
 * Calculate the required buckets of paint (Top Coat and Primer).
 *
 * Top Coat:    Math.ceil((sqMeters * 2) / 90)  — always 2 coats
 * Primer:      Depends on material + job type:
 *   - Metal:        Math.ceil(sqMeters / 100)
 *   - All others:   Math.ceil(sqMeters / 90)
 */
export const calculatePaint = (
  areaSqm: number,
  tileTypeName: string = '',
  jobType: string = '',
): {
  topCoatBuckets: number;
  primerBuckets: number;
  primerType: PrimerType;
} => {
  // 2 coats applied, 90m² per bucket across 2 coats = 45m² effective per bucket
  const topCoatBuckets = Math.ceil((areaSqm * 2) / 90);

  const primerType = getPrimerType(tileTypeName, jobType);

  let primerBuckets: number;
  if (primerType === 'Metal Primer') {
    primerBuckets = Math.ceil(areaSqm / 100);
  } else {
    primerBuckets = Math.ceil(areaSqm / 90);
  }

  return { topCoatBuckets, primerBuckets, primerType };
};

/**
 * Calculate the full Bill of Materials (BoM).
 */
export const calculateBillOfMaterials = (
  areaSqm: number,
  tileTypeName: string = '',
  jobType: string = '',
  profileName?: TileProfileName,
) => {
  const paint = calculatePaint(areaSqm, tileTypeName, jobType);

  const isMetal = tileTypeName.toLowerCase().includes('metal');
  const totalTiles =
    !isMetal && profileName ? calculateTiles(areaSqm, profileName) : 0;

  return {
    topCoatBuckets: paint.topCoatBuckets,
    primerBuckets: paint.primerBuckets,
    primerType: paint.primerType,
    totalTiles,
  };
};
