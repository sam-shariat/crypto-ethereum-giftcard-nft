import { v as styled$1$2, s as getShade$2, t as color$3, w as jsx$4, x as ButtonBase$1 } from "./index-946ae5ef.js";
import "./openlogin.esm-e8d3e4be.js";
import "./base.esm-570dabbe.js";
import "./elliptic-f2b24f57.js";
import "./index-2c674280.js";
import "./index-f8977440.js";
import "./url-d0ea8fe9.js";
import "./index-1b9e19c3.js";
import "./_commonjs-dynamic-modules-58f2b0ec.js";
const ButtonTranslucentStyled$1 = styled$1$2(ButtonBase$1)`
    background-color: ${getShade$2("dark", 20)};
    color: ${color$3.white};

    :active {
        border: 2px solid transparent;
    }

    :focus {
        box-shadow: 0px 0px 0px 2px ${color$3.paleCerulean};
    }

    svg {
        fill: ${color$3.white};
    }
`;
var styles = {
  ButtonTranslucentStyled: ButtonTranslucentStyled$1
};
const {
  ButtonTranslucentStyled
} = styles;
const ButtonTranslucent = ({
  ...props
}) => /* @__PURE__ */ jsx$4(ButtonTranslucentStyled, {
  ...props
});
export {
  ButtonTranslucent as default
};
