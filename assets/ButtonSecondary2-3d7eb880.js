import { E as styled$1$1, D as color$1, G as jsx$2, H as ButtonBase } from "./index-946ae5ef.js";
import "./openlogin.esm-e8d3e4be.js";
import "./base.esm-570dabbe.js";
import "./elliptic-f2b24f57.js";
import "./index-2c674280.js";
import "./index-f8977440.js";
import "./url-d0ea8fe9.js";
import "./index-1b9e19c3.js";
import "./_commonjs-dynamic-modules-58f2b0ec.js";
const ButtonSecondaryStyled$1 = styled$1$1(ButtonBase)`
    background-color: ${color$1.blueLight};
    border-color: ${color$1.blueLight};
    color: ${color$1.blue};

    :active {
        border-color: ${color$1.blue};
    }

    :focus {
        box-shadow: 0px 0px 0px 2px ${color$1.paleCerulean};
    }

    svg {
        fill: ${color$1.blue};
    }
`;
var styles = {
  ButtonSecondaryStyled: ButtonSecondaryStyled$1
};
const {
  ButtonSecondaryStyled
} = styles;
const ButtonSecondary = ({
  ...props
}) => /* @__PURE__ */ jsx$2(ButtonSecondaryStyled, {
  ...props
});
export {
  ButtonSecondary as default
};