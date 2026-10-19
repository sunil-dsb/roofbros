export type TileProfileName =
  | 'Marseille'
  | 'Nouveau'
  | 'Urban Shingle'
  | 'Elabana'
  | 'Tudor'
  | 'Horizon'
  | 'Atura'
  | 'Cambridge'
  | 'Madison'
  | string;

export type PrimerType =
  | 'High Build Primer'
  | 'WB Sealer'
  | 'Terracotta Primer'
  | 'Metal Primer'
  | 'None';

export const TERRACOTTA_PROFILES = ['Marseille', 'Nouveau', 'Urban Shingle'];

export const CONCRETE_PROFILES = [
  'Elabana',
  'Tudor',
  'Horizon',
  'Atura',
  'Cambridge',
  'Madison',
];

// Packaging constraints for seeded DB profiles — tiles per sqm and full row size
export const TILE_CONSTRAINTS: Record<
  string,
  { tilesPerSqm: number; fullRowSize: number }
> = {
  // Terracotta profiles
  Marseille: {
    tilesPerSqm: 12.5,
    fullRowSize: 56,
  },
  Nouveau: {
    tilesPerSqm: 12.5,
    fullRowSize: 68,
  },
  'Urban Shingle': {
    tilesPerSqm: 12.5,
    fullRowSize: 88,
  },
  // Concrete profiles
  Elabana: {
    tilesPerSqm: 10.8,
    fullRowSize: 100,
  },
  Tudor: {
    tilesPerSqm: 10.8,
    fullRowSize: 100,
  },
  Horizon: {
    tilesPerSqm: 11.2,
    fullRowSize: 80,
  },
  Atura: {
    tilesPerSqm: 11.33,
    fullRowSize: 100,
  },
  Cambridge: {
    tilesPerSqm: 11.2,
    fullRowSize: 80,
  },
  Madison: {
    tilesPerSqm: 11.2,
    fullRowSize: 80,
  },
};

/**
 * Determine the primer type based on tile material, job type, and profile name.
 */
export const getPrimerType = (
  tileTypeName: string = '',
  jobType: string = '',
  profileName: string = '',
): PrimerType => {
  const mat = tileTypeName.toLowerCase();
  const job = jobType.toLowerCase();
  const prof = profileName.toLowerCase().replace(/\\/g, '');

  // 1. Metal check
  if (mat.includes('metal') || prof.includes('metal')) {
    return 'Metal Primer';
  }

  // 2. Profile-based material check against seeded profiles
  const isConcreteProfile = CONCRETE_PROFILES.some(
    (p) => prof === p.toLowerCase() || prof.includes(p.toLowerCase()),
  );
  const isTerracottaProfile = TERRACOTTA_PROFILES.some(
    (p) =>
      prof === p.toLowerCase().replace(/\\/g, '') ||
      prof.includes(p.toLowerCase().replace(/\\/g, '')),
  );

  const isConcrete = mat.includes('concrete') || isConcreteProfile;
  const isTerracotta = mat.includes('terracotta') || isTerracottaProfile;

  if (isConcrete) {
    if (job.includes('restoration')) {
      return 'High Build Primer';
    }
    // Reroof or New Roof Installation → WB Sealer
    return 'WB Sealer';
  }

  if (isTerracotta) {
    return 'Terracotta Primer';
  }

  // 3. Fallbacks when tile type/profile is unspecified
  if (job.includes('restoration')) {
    return 'High Build Primer';
  }

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
  if (!profileName) {
    return Math.ceil(areaSqm * 10);
  }

  let profile = TILE_CONSTRAINTS[profileName];
  if (!profile) {
    const normalizedKey = Object.keys(TILE_CONSTRAINTS).find(
      (k) =>
        k.toLowerCase().replace(/\\/g, '') ===
        profileName.toLowerCase().replace(/\\/g, ''),
    );
    if (normalizedKey) {
      profile = TILE_CONSTRAINTS[normalizedKey];
    }
  }

  if (!profile) {
    const isTerra = TERRACOTTA_PROFILES.some((p) =>
      p.toLowerCase().includes(profileName.toLowerCase()),
    );
    const rate = isTerra ? 12.5 : 10.8;
    return Math.ceil(areaSqm * rate);
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
  profileName: string = '',
): {
  topCoatBuckets: number;
  primer: number;
  primerType: PrimerType;
} => {
  // 2 coats applied, 90m² per bucket across 2 coats = 45m² effective per bucket
  const topCoatBuckets = Math.ceil((areaSqm * 2) / 90);

  const primerType = getPrimerType(tileTypeName, jobType, profileName);

  let primer: number;
  if (primerType === 'Metal Primer') {
    primer = Math.ceil(areaSqm / 100);
  } else {
    primer = Math.ceil(areaSqm / 90);
  }

  return { topCoatBuckets, primer, primerType };
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
  const isMetal =
    tileTypeName.toLowerCase().includes('metal') ||
    Boolean(profileName && profileName.toLowerCase().includes('metal'));
  const normalizedJobType = jobType.toLowerCase();

  const isRestoration = normalizedJobType.includes('restoration');
  const isNewRoof = normalizedJobType.includes('new');

  const result: {
    topCoatBuckets?: number;
    primer?: number;
    primerType?: PrimerType;
    totalTiles?: number;
  } = {};

  if (!isNewRoof || isRestoration) {
    const paint = calculatePaint(
      areaSqm,
      tileTypeName,
      jobType,
      profileName || '',
    );
    result.topCoatBuckets = paint.topCoatBuckets;
    result.primer = paint.primer;
    result.primerType = paint.primerType;
  }

  if (!isRestoration) {
    result.totalTiles =
      !isMetal && profileName ? calculateTiles(areaSqm, profileName) : 0;
  }

  return result;
};
