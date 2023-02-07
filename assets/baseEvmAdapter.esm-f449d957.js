import { a1 as BaseAdapter, j as WalletLoginError, A as ADAPTER_STATUS, a2 as getSavedToken, a3 as checkIfTokenIsExpired, a4 as signChallenge, a5 as verifySignedChallenge, a6 as saveToken, a7 as clearToken } from "./base.esm-570dabbe.js";
class BaseEvmAdapter extends BaseAdapter {
  async authenticateUser() {
    var _this$chainConfig;
    if (!this.provider || !((_this$chainConfig = this.chainConfig) !== null && _this$chainConfig !== void 0 && _this$chainConfig.chainId))
      throw WalletLoginError.notConnectedError();
    const {
      chainNamespace,
      chainId
    } = this.chainConfig;
    if (this.status !== ADAPTER_STATUS.CONNECTED)
      throw WalletLoginError.notConnectedError("Not connected with wallet, Please login/connect first");
    const accounts = await this.provider.request({
      method: "eth_accounts"
    });
    if (accounts && accounts.length > 0) {
      const existingToken = getSavedToken(accounts[0], this.name);
      if (existingToken) {
        const isExpired = checkIfTokenIsExpired(existingToken);
        if (!isExpired) {
          return {
            idToken: existingToken
          };
        }
      }
      const payload = {
        domain: window.location.origin,
        uri: window.location.href,
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        version: "1",
        nonce: Math.random().toString(36).slice(2),
        issuedAt: new Date().toISOString()
      };
      const challenge = await signChallenge(payload, chainNamespace);
      const signedMessage = await this.provider.request({
        method: "personal_sign",
        params: [challenge, accounts[0]]
      });
      const idToken = await verifySignedChallenge(chainNamespace, signedMessage, challenge, this.name, this.sessionTime);
      saveToken(accounts[0], this.name, idToken);
      return {
        idToken
      };
    }
    throw WalletLoginError.notConnectedError("Not connected with wallet, Please login/connect first");
  }
  async disconnect() {
    if (this.status !== ADAPTER_STATUS.CONNECTED)
      throw WalletLoginError.disconnectionError("Not connected with wallet");
    const accounts = await this.provider.request({
      method: "eth_accounts"
    });
    if (accounts && accounts.length > 0) {
      clearToken(accounts[0], this.name);
    }
  }
}
export {
  BaseEvmAdapter as B
};
