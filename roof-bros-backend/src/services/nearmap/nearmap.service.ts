import config from '../../config/index.ts';
import { calculateTiles } from '../../shared/utils/calculateMaterial.ts';
import { genericUpload } from '../../shared/utils/Upload.ts';
import ApiError from '../../shared/utils/ApiError.ts';
import httpStatus from 'http-status';
// --- Nearmap type definitions ---

interface NearmapAttribute {
  description: string;
  pitch?: number;
  [key: string]: unknown;
}

interface NearmapFeature {
  id?: string;
  description?: string;
  confidence?: number;
  areaSqm?: number;
  attributes?: NearmapAttribute[];
  geometry?: unknown;
  [key: string]: unknown;
}

interface NearmapResource {
  id?: string;
  type?: string;
  format?: string;
  [key: string]: unknown;
}

export const getCoverageService = async (address: string) => {
  if (!config.nearmapApiKey) {
    throw new ApiError(
      'Nearmap API Key is not configured',
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  const url = new URL('https://api.nearmap.com/coverage/v2/tx/address');
  url.searchParams.append('address', address);
  url.searchParams.append('apikey', config.nearmapApiKey);
  url.searchParams.append('country', 'AU');
  url.searchParams.append('resources', 'raster:Vert,aiPacks:roof_char');
  url.searchParams.append('dates', 'single');
  url.searchParams.append('filter', 'allTypes');
  url.searchParams.append('preview', 'false');
  url.searchParams.append('aiOn3dCoverage', 'true');

  const headers: HeadersInit = {
    Accept: 'application/json',
  };

  if (config.nearmapAuthToken) {
    headers['Authorization'] = config.nearmapAuthToken;
  }

  const response = await fetch(url.toString(), { headers });

  if (!response.ok) {
    throw new ApiError(
      `Nearmap Coverage API error: ${response.statusText}`,
      httpStatus.BAD_GATEWAY,
    );
  }

  return await response.json();
};

export const getFeaturesService = async (
  surveyResourceId: string,
  transactionToken: string,
) => {
  const url = new URL(
    `https://api.nearmap.com/ai/features/v4/tx/surveyresources/${surveyResourceId}/features.json`,
  );
  url.searchParams.append('transactionToken', transactionToken);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new ApiError(
      `Nearmap Features API error: ${response.statusText}`,
      httpStatus.BAD_GATEWAY,
    );
  }

  return await response.json();
};

export const getStaticMapStreamService = async (
  surveyId: string,
  transactionToken: string,
  x: string = '0',
  y: string = '0',
  tileSize: string = '4096x4096',
) => {
  const url = new URL(
    `https://api.nearmap.com/staticmap/v3/surveys/${surveyId}/Vert.png`,
  );
  url.searchParams.append('x', x);
  url.searchParams.append('y', y);
  url.searchParams.append('tileSize', tileSize);
  url.searchParams.append('transactionToken', transactionToken);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new ApiError(
      `Nearmap Transaction API error: ${response.statusText}`,
      httpStatus.BAD_GATEWAY,
    );
  }

  // Return the Response object directly so the controller can pipe the stream
  return response;
};

export const getConsolidatedDataService = async (address: string) => {
  // 1. Fetch coverage
  const coverageData = await getCoverageService(address);
  const transactionToken =
    coverageData.transactionToken ||
    coverageData.payload?.transactionToken ||
    '';

  const tileSizeInPixels =
    coverageData.tileSizeInPixels ||
    coverageData.payload?.tileSizeInPixels ||
    4096;

  const surveys =
    coverageData.surveys ||
    coverageData.payload?.surveys ||
    (Array.isArray(coverageData) ? coverageData : []);
  const survey = surveys[0];
  if (!survey) {
    throw new ApiError(
      'No surveys found for this address in Nearmap',
      httpStatus.NOT_FOUND,
    );
  }

  const bbox =
    coverageData.bbox || coverageData.payload?.bbox || survey.bbox || '';

  const surveyId = survey.id || survey.surveyId;
  let surveyResourceId = surveyId;

  // Nearmap coverage API v2 provides aiResourceId directly on the survey object
  if (survey.aiResourceId) {
    surveyResourceId = survey.aiResourceId;
  } else if (survey.resources && Array.isArray(survey.resources)) {
    // Fallback for older formats if applicable
    const featureResource = (survey.resources as NearmapResource[]).find(
      (r: NearmapResource) =>
        r.id &&
        (r.type === 'FeatureData' ||
          r.type === 'AiPack' ||
          r.format === 'json'),
    );
    if (featureResource) surveyResourceId = featureResource.id;
  }

  // 2. Fetch features and static map concurrently
  const [featuresData, staticMapResponse] = await Promise.all([
    getFeaturesService(surveyResourceId, transactionToken).catch((err) => {
      console.error('Failed to get Nearmap features:', err.message);
      return {};
    }),
    getStaticMapStreamService(
      surveyId,
      transactionToken,
      '0',
      '0',
      '4096x4096',
    ).catch((err) => {
      console.error('Failed to get Nearmap static map:', err.message);
      return null;
    }),
  ]);

  // 3. Process the image to R2
  let roofImage = '';
  if (staticMapResponse && staticMapResponse.ok) {
    const arrayBuffer = await staticMapResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType =
      staticMapResponse.headers.get('content-type') || 'image/png';

    roofImage = await genericUpload(
      'job/roof_image',
      `roof_${surveyId}.png`,
      buffer,
      contentType,
    );
  }

  // 4. Extract data using targeted logic instead of deep search
  let area_sq_mt = 0;
  let pitch = 0;
  let confidence = 0;
  let geometry: unknown = null;

  // Find the features array anywhere in the featuresData object
  let featuresArray: NearmapFeature[] | null = null;
  const findFeaturesArray = (obj: unknown): void => {
    if (featuresArray) return;
    if (
      Array.isArray(obj) &&
      obj.length > 0 &&
      (obj[0] as NearmapFeature).description &&
      (obj[0] as NearmapFeature).id
    ) {
      featuresArray = obj as NearmapFeature[];
      return;
    }
    if (obj && typeof obj === 'object') {
      const record = obj as Record<string, unknown>;
      if (Array.isArray(record.features)) {
        featuresArray = record.features as NearmapFeature[];
        return;
      }
      for (const val of Object.values(record)) {
        if (typeof val === 'object') findFeaturesArray(val);
      }
    }
  };
  findFeaturesArray(featuresData);

  if (featuresArray && Array.isArray(featuresArray)) {
    // There can be multiple features with description 'Roof'. We want the one with 'attributes'.
    const roofFeatures = (featuresArray as NearmapFeature[]).filter(
      (f: NearmapFeature) => f.description === 'Roof',
    );

    for (const roofFeature of roofFeatures) {
      // Prioritize the roof feature that actually has attributes to extract
      if (
        roofFeature.attributes &&
        Array.isArray(roofFeature.attributes) &&
        roofFeature.attributes.length > 0
      ) {
        // Option A: Extract data for the whole roof plane
        confidence = roofFeature.confidence || confidence || 0;

        // Extract Area directly from the roof feature (NOT the material components)
        if (roofFeature.areaSqm && roofFeature.areaSqm > 0) {
          area_sq_mt = roofFeature.areaSqm;
        }

        // Extract Pitch
        const roof3dAttr = roofFeature.attributes.find(
          (a: NearmapAttribute) => a.description === 'Roof 3d attributes',
        );
        if (roof3dAttr && roof3dAttr.pitch) {
          pitch = roof3dAttr.pitch;
        }

        if (roofFeature.geometry) {
          geometry = roofFeature.geometry;
        }

        // If we found the values, we can break out of the loop
        if (area_sq_mt > 0 && pitch > 0 && geometry) break;
      }
    }

    // If we couldn't find attributes in any, fallback to the first roof feature's confidence
    if (confidence === 0 && roofFeatures.length > 0) {
      confidence = roofFeatures[0]?.confidence ?? 0;
    }
  }

  // We'll normalize confidence if it's a decimal (e.g., 0.95 -> 95.0)
  if (confidence > 0 && confidence <= 1.0) {
    confidence = parseFloat((confidence * 100).toFixed(1));
  }

  const area_square = area_sq_mt
    ? parseFloat((area_sq_mt / 9.2903).toFixed(2))
    : 0;

  // Calculate totalTiles (using fallback since profile isn't known yet)
  const totalTiles = calculateTiles(area_sq_mt, '');

  return {
    area_sq_mt,
    confidence,
    pitch,
    tilesize: tileSizeInPixels, // Dynamically extracted from Nearmap coverage API
    totalTiles,
    area_square,
    roofImage,
    bbox,
    geometry,
  };
};
