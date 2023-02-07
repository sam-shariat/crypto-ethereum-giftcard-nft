import{v as e,s as r,w as n,x as a}from"./index-dcde6c0a.js";import"./openlogin.esm-3de162c4.js";import"./base.esm-e36f3d2a.js";import"./elliptic-75fd6b2c.js";import"./index-2a7c4012.js";import"./index-346e2c9d.js";import"./url-5da867a5.js";import"./index-2a1b3d9a.js";import"./_commonjs-dynamic-modules-302442b1.js";const l=e(a)`
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
