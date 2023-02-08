import{v as e,s as r,w as n,x as a}from"./index-c81d2584.js";import"./openlogin.esm-6792e0df.js";import"./base.esm-fa69d14c.js";import"./elliptic-d7df13bb.js";import"./index-365b9d9e.js";import"./index-30c007b7.js";import"./url-54fb6cb0.js";import"./index-2a1b3d9a.js";const l=e(a)`
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
`;var u={ButtonCustomStyled:l};const{ButtonCustomStyled:i}=u,k=({customize:t,...o})=>n(i,{customize:t,...o});export{k as default};
