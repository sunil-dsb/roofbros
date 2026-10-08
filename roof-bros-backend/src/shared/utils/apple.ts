import axios from 'axios';
import { logger } from '../../config/logger.ts';
import config from '../../config/index.ts';
import { generateAppleClientSecret } from './auth.ts';
/**
 * Exchanges an Apple authorization code for tokens (access_token & refresh_token).
 * @param clientId The client_id of the app
 * @param clientSecret The generated client_secret (JWT)
 * @param authorizationCode The authorization code from Apple Sign-In
 */
export async function exchangeAppleAuthorizationCode(
  clientId: string,
  clientSecret: string,
  authorizationCode: string,
) {
  try {
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('code', authorizationCode);
    params.append('grant_type', 'authorization_code');

    const response = await axios.post(
      'https://appleid.apple.com/auth/oauth2/v2/token',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (response.status === 200 && response.data) {
      return {
        accessToken: response.data.access_token as string | undefined,
        refreshToken: response.data.refresh_token as string | undefined,
        expiresIn: response.data.expires_in as number | undefined,
        idToken: response.data.id_token as string | undefined,
      };
    }

    logger.warn('Failed to exchange Apple authorization code', {
      status: response.status,
      data: response.data,
    });
    return null;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      logger.error('Error exchanging Apple authorization code', {
        error: error.message,
        response: error.response?.data,
      });
    } else if (error instanceof Error) {
      logger.error('Error exchanging Apple authorization code', {
        error: error.message,
      });
    } else {
      logger.error('Error exchanging Apple authorization code', { error });
    }
    return null;
  }
}

/**
 * Revokes an Apple token (access or refresh token).
 * @param clientId The client_id of the app
 * @param clientSecret The generated client_secret (JWT)
 * @param token The token to revoke
 * @param tokenTypeHint The hint: 'refresh_token' or 'access_token'
 */
export async function revokeAppleToken(
  clientId: string,
  clientSecret: string,
  token: string,
  tokenTypeHint: 'access_token' | 'refresh_token' = 'refresh_token',
) {
  try {
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('token', token);
    params.append('token_type_hint', tokenTypeHint);

    const response = await axios.post(
      'https://appleid.apple.com/auth/oauth2/v2/revoke',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (response.status === 200) {
      logger.info('Successfully revoked Apple token');
      return true;
    }

    logger.warn('Failed to revoke Apple token', { status: response.status });
    return false;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      logger.error('Error revoking Apple token', {
        error: error.message,
        response: error.response?.data,
      });
    } else if (error instanceof Error) {
      logger.error('Error revoking Apple token', {
        error: error.message,
      });
    } else {
      logger.error('Error revoking Apple token', { error });
    }
    return false;
  }
}

/**
 * High-level helper to revoke an Apple account using available tokens or codes.
 */
export async function revokeAppleAccount(appleAccount: {
  refreshToken?: string | null;
  accessToken?: string | null;
}) {
  if (!appleAccount.refreshToken && !appleAccount.accessToken) {
    logger.warn('No token available for Apple account revocation');
    return false;
  }

  const clientSecret = await generateAppleClientSecret(
    config.appleClientId,
    config.appleTeamId,
    config.appleKeyId,
    config.applePrivateKey,
  );

  // 1. Try refresh token if available
  if (appleAccount.refreshToken) {
    logger.info('Attempting Apple token revocation using stored refresh token');
    const success = await revokeAppleToken(
      config.appleClientId,
      clientSecret,
      appleAccount.refreshToken,
      'refresh_token',
    );
    if (success) return true;
  }

  // 2. If no refresh token or if refresh token revocation failed, but we have accessToken:
  if (appleAccount.accessToken) {
    // Attempt code exchange first in case accessToken is an authorization code
    logger.info('Attempting Apple code exchange before revocation');
    const exchanged = await exchangeAppleAuthorizationCode(
      config.appleClientId,
      clientSecret,
      appleAccount.accessToken,
    );

    if (exchanged && exchanged.refreshToken) {
      logger.info('Code exchange succeeded; revoking generated refresh token');
      const success = await revokeAppleToken(
        config.appleClientId,
        clientSecret,
        exchanged.refreshToken,
        'refresh_token',
      );
      if (success) return true;
    }

    // 3. Fallback: attempt direct revocation using access_token
    logger.info('Attempting direct Apple revocation using access token');
    const success = await revokeAppleToken(
      config.appleClientId,
      clientSecret,
      appleAccount.accessToken,
      'access_token',
    );
    if (success) return true;
  }

  logger.warn('Could not revoke Apple token with available parameters');
  return false;
}
