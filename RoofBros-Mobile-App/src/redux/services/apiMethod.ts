export const Method = {
  GET(builder: any, url: string, header?: any) {
    return builder.query({
      query: (body: any) => {
        const requestConfig: { url: string; method: string; headers?: any; params?: any } = {
          url: url,
          method: 'GET',
          headers: header,
        };
        if (body && typeof body === 'object' && Object.keys(body).length > 0) {
          requestConfig.params = body;
        }
        return requestConfig;
      },
    });
  },
  POST(builder: any, url: string, header?: any) {
    return builder.mutation({
      query: (body: any) => ({
        url: url,
        method: 'POST',
        body: body,
        headers: header,
        formData: true,
      }),
    });
  },
  PUT(builder: any, url: string, header?: any) {
    return builder.mutation({
      query: (body: any) => ({
        url: url,
        method: 'PUT',
        body: body,
        headers: header,
        formData: true,
      }),
    });
  },
  DELETE(builder: any, url: string, header?: any) {
    return builder.mutation({
      query: (body: any) => ({
        url: url,
        method: 'DELETE',
        body: body,
        headers: header,
      }),
    });
  },
  PATCH(builder: any, url: string, header?: any) {
    console.log(url, 'url');
    return builder.mutation({
      query: (body: any) => ({
        url: url,
        method: 'PATCH',
        body: body,
        headers: header,
      }),
    });
  },
  PATCHPARAMS_WITH_SUFFIX(builder: any, url: string, suffix: string, header?: any, isFormData: boolean = false) {
    return builder.mutation({
      query: ({ id, body }: { id: string | number; body: any }) => ({
        url: `${url}/${id}${suffix}`,
        method: 'PATCH',
        body,
        headers: header,
        formData: isFormData,
      }),
      invalidatesTags: (result: any, error: any, { id }: any) => [{ type: 'Job', id }],
    });
  },
  POSTPARAMS_WITH_SUFFIX(builder: any, url: string, suffix: string, header?: any, isFormData: boolean = false) {
    return builder.mutation({
      query: ({ id, body }: { id: string | number; body: any }) => ({
        url: `${url}/${id}${suffix}`,
        method: 'POST',
        body,
        headers: header,
        formData: isFormData,
      }),
      invalidatesTags: (result: any, error: any, { id }: any) => [{ type: 'Job', id }],
    });
  },
  GETPARAMS(builder: any, url: string, header?: any) {
    return builder.mutation({
      query: (id: string | number) => ({
        url: `${url}/${id}`,
        method: 'GET',
        headers: header,
      }),
    });
  },
  GETPARAMS_QUERY(builder: any, url: string, header?: any) {
    return builder.query({
      query: (id: string | number) => ({
        url: `${url}/${id}`,
        method: 'GET',
        headers: header,
      }),
      providesTags: (result: any, error: any, id: string) => [{ type: 'Job', id }],
    });
  },
  DELETEPARAMS(builder: any, url: string, header?: any) {
    return builder.mutation({
      query: (id: string | number) => ({
        url: `${url}/${id}`,
        method: 'DELETE',
        headers: header,
      }),
    });
  },
};
