var dist;
var hasRequiredDist;
function requireDist() {
  if (hasRequiredDist)
    return dist;
  hasRequiredDist = 1;
  function detectEthereumProvider({ mustBeMetaMask = false, silent = false, timeout = 3e3 } = {}) {
    _validateInputs();
    let handled = false;
    return new Promise((resolve) => {
      if (window.ethereum) {
        handleEthereum();
      } else {
        window.addEventListener("ethereum#initialized", handleEthereum, { once: true });
        setTimeout(() => {
          handleEthereum();
        }, timeout);
      }
      function handleEthereum() {
        if (handled) {
          return;
        }
        handled = true;
        window.removeEventListener("ethereum#initialized", handleEthereum);
        const { ethereum } = window;
        if (ethereum && (!mustBeMetaMask || ethereum.isMetaMask)) {
          resolve(ethereum);
        } else {
          const message = mustBeMetaMask && ethereum ? "Non-MetaMask window.ethereum detected." : "Unable to detect window.ethereum.";
          !silent && console.error("@metamask/detect-provider:", message);
          resolve(null);
        }
      }
    });
    function _validateInputs() {
      if (typeof mustBeMetaMask !== "boolean") {
        throw new Error(`@metamask/detect-provider: Expected option 'mustBeMetaMask' to be a boolean.`);
      }
      if (typeof silent !== "boolean") {
        throw new Error(`@metamask/detect-provider: Expected option 'silent' to be a boolean.`);
      }
      if (typeof timeout !== "number") {
        throw new Error(`@metamask/detect-provider: Expected option 'timeout' to be a number.`);
      }
    }
  }
  dist = detectEthereumProvider;
  return dist;
}
export {
  requireDist as r
};
