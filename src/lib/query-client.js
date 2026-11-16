import { QueryClient } from '@tanstack/react-query';


export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
            staleTime: 60_000,
            retry: (failureCount,error) => {
              const status=Number(error?.response?.status||error?.status||0);
              if([400,401,403,404,409,422,429,503].includes(status)||/rate limit|too many requests|retry after/i.test(String(error?.response?.data?.error||error?.message||'')))return false;
              return failureCount<1;
            },
		},
	},
});