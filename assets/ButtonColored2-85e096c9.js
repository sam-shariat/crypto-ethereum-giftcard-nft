import{D as r,E as l,G as o,H as a,J as n,K as s}from"./index-147c8c39.js";import"./openlogin.esm-ed8f5bf7.js";import"./base.esm-93c22595.js";import"./elliptic-574a03b9.js";import"./index-88d43be4.js";import"./index-8125efb3.js";import"./url-708422c9.js";import"./index-2a1b3d9a.js";import"./_commonjs-dynamic-modules-302442b1.js";const t=r`
    :after {
        background-color: ${l("light",90)};
    }

    :hover {
        :after {
            background-color: ${l("light",70)};
        }
    }

    :active {
        :after {
            background-color: ${l("light",50)};
        }
    }
`,d=r`
    background-color: ${o.red};
    border-color: ${o.red};
    color: ${o.red};

    :focus {
        box-shadow: 0px 0px 0px 2px ${o.paleCerulean};
    }

    svg {
        fill: ${o.red};
    }

    ${t}
`,$=r`
    background-color: ${o.green};
    border-color: ${o.green};
    color: ${o.green};

    :focus {
        box-shadow: 0px 0px 0px 2px ${o.paleCerulean};
    }

    svg {
        fill: ${o.green};
    }

    ${t}
`,u=r`
    background-color: ${o.blue};
    border-color: ${o.blue};
    color: ${o.blue};

    :focus {
        box-shadow: 0px 0px 0px 2px ${o.paleCerulean};
    }

    svg {
        fill: ${o.blue};
    }

    ${t}
`,p=r`
    background-color: ${o.yellow};
    border-color: ${o.yellow};
    color: ${o.yellow};

    :focus {
        box-shadow: 0px 0px 0px 2px ${o.paleCerulean};
    }

    svg {
        fill: ${o.yellow};
    }

    ${t}
`,i=e=>{switch(e){case"red":return d;case"green":return $;case"blue":return u;case"yellow":return p;default:return}},b=a(s)`
    :after {
        background-color: ${l("dark",0)};
        content: '';
        display: block;
        height: 100%;
        left: 0;
        pointer-events: none;
        position: absolute;
        top: 0;
        transition: all 0.3s ease;
        width: 100%;
        z-index: 0;
    }

    ${({color:e})=>e&&i(e)}
`;var g={ButtonColoredStyled:b};const{ButtonColoredStyled:x}=g,S=({color:e,...c})=>n(x,{color:e,...c});export{S as default};
