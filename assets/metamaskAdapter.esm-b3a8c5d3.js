import{b as h,f as i,i as d,C as o,p as c,m as n,A as e,W as m,k as r,l,h as E,j as a}from"./base.esm-e36f3d2a.js";import{r as u}from"./index-2a1b3d9a.js";import{B as A}from"./baseEvmAdapter.esm-4d4128f0.js";var p=u();const C=h(p);class v extends A{constructor(){let t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};super(),i(this,"adapterNamespace",d.EIP155),i(this,"currentChainNamespace",o.EIP155),i(this,"type",c.EXTERNAL),i(this,"name",n.METAMASK),i(this,"status",e.NOT_READY),i(this,"rehydrated",!1),i(this,"metamaskProvider",null),this.chainConfig=t.chainConfig||null,this.sessionTime=t.sessionTime||86400}get provider(){return this.status===e.CONNECTED&&this.metamaskProvider?this.metamaskProvider:null}set provider(t){throw new Error("Not implemented")}async init(t){if(super.checkInitializationRequirements(),this.metamaskProvider=await C({mustBeMetaMask:!0}),!this.metamaskProvider)throw m.notInstalled("Metamask extension is not installed");this.status=e.READY,this.emit(r.READY,n.METAMASK);try{l.debug("initializing metamask adapter"),t.autoConnect&&(this.rehydrated=!0,await this.connect())}catch(s){this.emit(r.ERRORED,s)}}setAdapterSettings(t){this.status!==e.READY&&t!=null&&t.sessionTime&&(this.sessionTime=t.sessionTime)}async connect(){if(super.checkConnectionRequirements(),this.chainConfig||(this.chainConfig=E(o.EIP155,1)),this.status=e.CONNECTING,this.emit(r.CONNECTING,{adapter:n.METAMASK}),!this.metamaskProvider)throw a.notConnectedError("Not able to connect with metamask");try{await this.metamaskProvider.request({method:"eth_requestAccounts"});const{chainId:t}=this.metamaskProvider;if(t!==this.chainConfig.chainId&&await this.switchChain(this.chainConfig),this.status=e.CONNECTED,!this.provider)throw a.notConnectedError("Failed to connect with provider");return this.provider.once("disconnect",()=>{this.disconnect()}),this.emit(r.CONNECTED,{adapter:n.METAMASK,reconnected:this.rehydrated}),this.provider}catch(t){throw this.status=e.READY,this.rehydrated=!1,this.emit(r.ERRORED,t),a.connectionError("Failed to login with metamask wallet")}}async disconnect(){var t;let s=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{cleanup:!1};await super.disconnect(),(t=this.provider)===null||t===void 0||t.removeAllListeners(),s.cleanup?(this.status=e.NOT_READY,this.metamaskProvider=null):this.status=e.READY,this.rehydrated=!1,this.emit(r.DISCONNECTED)}async getUserInfo(){if(this.status!==e.CONNECTED)throw a.notConnectedError("Not connected with wallet, Please login/connect first");return{}}async switchChain(t){if(!this.metamaskProvider)throw a.notConnectedError("Not connected with wallet");try{await this.metamaskProvider.request({method:"wallet_switchEthereumChain",params:[{chainId:t.chainId}]})}catch(s){if(s.code===4902)await this.metamaskProvider.request({method:"wallet_addEthereumChain",params:[{chainId:t.chainId,chainName:t.displayName,rpcUrls:[t.rpcTarget]}]});else throw s}}}export{v as MetamaskAdapter};