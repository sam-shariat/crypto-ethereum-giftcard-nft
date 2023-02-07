import * as React from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { MoralisProvider } from "react-moralis";
import theme from "./theme";
import App from "./App";
import { NotificationProvider } from "web3uikit";
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://api.studio.thegraph.com/query/40816/giftcardnft/v0.0.2",
});

root.render(
  <ThemeProvider theme={theme}>
    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
    <CssBaseline />
    <MoralisProvider initializeOnMount={false}>
      <ApolloProvider client={client}>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </ApolloProvider>
    </MoralisProvider>
  </ThemeProvider>
);
