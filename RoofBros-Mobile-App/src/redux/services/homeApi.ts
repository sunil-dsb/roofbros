import {emptySplitApi, header1, header2} from './rtkquery';

import {Method} from './apiMethod';
import {apiEndPoint} from './apiEndPoint';

export const homeApi = emptySplitApi.injectEndpoints({
  endpoints: builder => ({
    getNearmapRoofDetails: builder.query({
      query: (address: string) => ({
        url: `nearmap/roof-details?address=${encodeURIComponent(address)}`,
        method: 'GET',
        headers: header1,
      }),
    }),
    getJobs: Method.GET(builder, apiEndPoint.getJobs, header1),
    getJobDetail: Method.GETPARAMS_QUERY(builder, apiEndPoint.getJobDetail, header1),
    calculateMaterial: Method.POST(builder, apiEndPoint.calculateMaterial, header1),
    createJob: Method.POST(builder, apiEndPoint.createJob, header1),
    addJobNote: Method.PATCHPARAMS_WITH_SUFFIX(builder, apiEndPoint.getJobs, '/notes', header1),
    addJobPhoto: Method.PATCHPARAMS_WITH_SUFFIX(builder, apiEndPoint.getJobs, '/dropzone-photos', header2, true),
    getJobQuotes: Method.GETPARAMS_QUERY(builder, apiEndPoint.getJobQuotes, header1),
    getSingleJobQuoteDetail: Method.GETPARAMS_QUERY(builder, apiEndPoint.getSingleJobQuoteDetail, header1),
    createJobQuote: Method.POSTPARAMS_WITH_SUFFIX(builder, apiEndPoint.getJobQuotes, '', header1),
    requestDelivery: Method.POSTPARAMS_WITH_SUFFIX(builder, apiEndPoint.requestDelivery, '/request', header2, true),

  }),
});

export const {
  useLazyGetNearmapRoofDetailsQuery,
  useGetNearmapRoofDetailsQuery,
  useLazyGetJobsQuery,
  useLazyGetJobDetailQuery,
  useCalculateMaterialMutation,
  useCreateJobMutation,
  useAddJobNoteMutation,
  useAddJobPhotoMutation,
  useLazyGetJobQuotesQuery,
  useLazyGetSingleJobQuoteDetailQuery,
  useGetSingleJobQuoteDetailQuery,
  useCreateJobQuoteMutation,
  useRequestDeliveryMutation
} = homeApi;

