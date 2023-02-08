import{v as e,s as r,w as n,x as a}from"./index-45f412d8.js";import"./openlogin.esm-ab039618.js";import"./base.esm-a6e8b20d.js";import"./elliptic-aa16d8cf.js";import"./index-66434860.js";import"./index-50a7582d.js";import"./url-4a71cc4c.js";import"./index-2a1b3d9a.js";import"./_commonjs-dynamic-modules-302442b1.js";const l=e(a)`
    background-color: ${t=>{var o;return(o=t.customize)==null?void 0:o.backgroundColor}};

    span {
        color: ${t=>{var o;return(o=t.customize)==null?void 0:o.textColor}};
        font-size: ${t=>{var o;return((o=t.customize)==null?void 0:o.fontSize)+"px"}};
    }

    svg {
        fill: ${t=>{var o;return(o=t.customize)==null?void 0:o.textColor}};
    }

    :after {
        background-color: transparent;
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

    :hover {
        background-color: ${t=>{var o;return(o=t.customize)==null?void 0:o.backgroundColor}};

        :after {
            background-color: ${t=>{var o;return((o=t.customize)==null?void 0:o.onHover)==="lighten"?r("light",20):r("dark",20)}};
        }
    }

    :active {
        :after {
            background-color: ${t=>{var o;return((o=t.customize)==null?void 0:o.onHover)==="lighten"?r("light",40):r("dark",40)}};
        }
    }
`;var i={ButtonCustomStyled:l};const{ButtonCustomStyled:u}=i,z=({customize:t,...o})=>n(u,{customize:t,...o});export{z as default};
