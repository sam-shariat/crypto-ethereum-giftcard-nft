import { E as styled$1$1, A as getShade, D as color$1, G as jsx$2, H as ButtonBase } from "./index-4b14234c.js";
import "./openlogin.esm-e718131c.js";
import "./base.esm-570dabbe.js";
import "./elliptic-f2b24f57.js";
import "./index-2c674280.js";
import "./index-f8977440.js";
import "./url-d0ea8fe9.js";
import "./index-1b9e19c3.js";
import "./_commonjs-dynamic-modules-58f2b0ec.js";
const ButtonTranslucentStyled$1 = styled$1$1(ButtonBase)`
    background-color: ${getShade("dark", 20)};
    color: ${color$1.white};

    :active {
        border: 2px solid transparent;
    }

    :focus {
        box-shadow: 0px 0px 0px 2px ${color$1.paleCerulean};
    }

    svg {
        fill: ${color$1.white};
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
}) => /* @__PURE__ */ jsx$2(ButtonTranslucentStyled, {
  ...props
});
export {
  ButtonTranslucent as default
};
