import * as React from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { MoralisProvider } from "react-moralis";
import theme from "./theme";
import App from "./App";
import { NotificationProvider, Typography } from "web3uikit";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { TourProvider } from "@reactour/tour";
import { GRAPH_URI, TOUR_STEPS } from "./constants/constants";
import TourComponent from "./components/nav/TourComponent";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: GRAPH_URI,
});

root.render(
  <ThemeProvider theme={theme}>
    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
    <CssBaseline />
    <MoralisProvider initializeOnMount={false}>
      <ApolloProvider client={client}>
        <NotificationProvider>
          <TourProvider steps={TOUR_STEPS} ContentComponent={TourComponent}>
            <App />
          </TourProvider>
        </NotificationProvider>
      </ApolloProvider>
    </MoralisProvider>
  </ThemeProvider>
);
