import type { AppProps } from "next/app";
import { CacheProvider } from "@emotion/react";
import { TssCacheProvider } from "tss-react";
import createCache from "@emotion/cache";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import theme from "@/theme/theme";
import { AuthContextProvider } from "@/context/AuthContext";
import "@/styles/globals.css";
import TopBar from "@/components/TopBar/TopBar";
import { ProducerContextProvider } from "@/context/ProducerContext";
import { useRouter } from "next/router";

const muiCache = createCache({
  key: "mui",
  prepend: true,
});

const tssCache = createCache({
  key: "tss",
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <CacheProvider value={muiCache}>
      <TssCacheProvider value={tssCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthContextProvider>
            <ProducerContextProvider>
              <>
                {router.pathname.includes("privacyPolicy") ||
                router.pathname.includes("joinUs") ? (
                  <Box
                    sx={{
                      margin: {
                        xs: "0px 16px", // default margin for small screens
                        md: "0px 32px", // margin for medium screens and up
                      },
                    }}
                  >
                    <Component {...pageProps} />
                  </Box>
                ) : (
                  <TopBar>
                    <Box
                      sx={{
                        margin: {
                          xs: "0px 16px", // default margin for small screens
                          md: "0px 32px", // margin for medium screens and up
                        },
                      }}
                    >
                      <Component {...pageProps} />
                    </Box>
                  </TopBar>
                )}
              </>
            </ProducerContextProvider>
          </AuthContextProvider>
        </ThemeProvider>
      </TssCacheProvider>
    </CacheProvider>
  );
}
