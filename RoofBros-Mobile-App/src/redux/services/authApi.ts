import {emptySplitApi, header1, BASE_URL_NO_V1} from './rtkquery';
import {Method} from './apiMethod';
import {apiEndPoint} from './apiEndPoint';



export const authApi = emptySplitApi.injectEndpoints({
  endpoints: (builder) => ({
    login: Method.POST(builder, apiEndPoint.login, header1),
    signUp: Method.POST(builder, apiEndPoint.signup, header1),
    socialLogin: builder.mutation({
      query: (body: any) => ({
        url: `${BASE_URL_NO_V1}${apiEndPoint.socialLogin}`,
        method: 'POST',
        body,
        headers: header1,
      }),
    }),
    sendOtp: Method.POST(builder, apiEndPoint.sendOtp, header1),
    verifyEmail: Method.POST(builder, apiEndPoint.verifyEmail, header1),
    verifyForgotOtp : Method.POST(builder, apiEndPoint.verifyForgotOtp, header1),
    forgotPassword: Method.POST(builder, apiEndPoint.forgotPassword, header1),
    resetPassword: Method.POST(builder, apiEndPoint.resetPassword, header1),
    changePassword: Method.POST(builder, apiEndPoint.changePassword, header1),
    getProfile: Method.GET(builder, apiEndPoint.getProfile, header1),
    getBusinessDetails: builder.query({
      query: (abn: string | number) => ({
        url: `${apiEndPoint.getBusinessDetails}/${abn}`,
        method: 'GET',
        headers: header1,
      }),
    }),
    updateBusinessDetails: Method.PUT(builder, apiEndPoint.updateBusinessDetails, header1),
    getTiles: Method.GET(builder, apiEndPoint.getTiles, header1),
    getTileProfiles: builder.query({
      query: (params: { tileId?: string | number, profileType?: string } | string | number) => {
        let tileId;
        let profileType;
        if (typeof params === 'object' && params !== null) {
          tileId = params.tileId;
          profileType = params.profileType;
        } else {
          tileId = params;
        }
        let url = tileId ? `tiles/${tileId}/profiles` : 'tiles';
        if (profileType) {
          url += `?profileType=${profileType}`;
        }
        return {
          url,
          method: 'GET',
          headers: header1,
        };
      },
    }),
    getTileColors: builder.query({
      query: (profileId?: string | number) => ({
        url: profileId ? `tiles/colors?profileId=${profileId}` : 'tiles/colors',
        method: 'GET',
        headers: header1,
      }),
    }),
    deleteAccount: Method.DELETE(builder, apiEndPoint.deleteAccount, header1),
  }),
});

export const {
 useLoginMutation,
 useSignUpMutation,
 useSocialLoginMutation,
 useSendOtpMutation,
 useVerifyEmailMutation,
 useVerifyForgotOtpMutation,
 useForgotPasswordMutation,
 useResetPasswordMutation,
 useChangePasswordMutation,
 useLazyGetProfileQuery,
 useLazyGetBusinessDetailsQuery,
 useUpdateBusinessDetailsMutation,
 useLazyGetTilesQuery,
 useLazyGetTileProfilesQuery,
 useLazyGetTileColorsQuery,
 useDeleteAccountMutation,
} = authApi;

