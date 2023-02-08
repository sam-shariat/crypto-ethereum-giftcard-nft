import{z as r,A as l,D as o,E as a,G as n,H as s}from"./index-09fa042d.js";import"./openlogin.esm-3de162c4.js";import"./base.esm-e36f3d2a.js";import"./elliptic-75fd6b2c.js";import"./index-2a7c4012.js";import"./index-346e2c9d.js";import"./url-5da867a5.js";import"./index-2a1b3d9a.js";import"./_commonjs-dynamic-modules-302442b1.js";const t=r`
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
