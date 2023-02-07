import { E as styled$1$1, D as color$1, G as jsx$2, H as ButtonBase } from "./index-946ae5ef.js";
import "./openlogin.esm-e8d3e4be.js";
import "./base.esm-570dabbe.js";
import "./elliptic-f2b24f57.js";
import "./index-2c674280.js";
import "./index-f8977440.js";
import "./url-d0ea8fe9.js";
import "./index-1b9e19c3.js";
import "./_commonjs-dynamic-modules-58f2b0ec.js";
const ButtonPrimaryStyled$1 = styled$1$1(ButtonBase)`
    background-color: ${color$1.green};
    border-color: ${color$1.greenLight};
    color: ${color$1.white};

    :hover {
        background: radial-gradient(
                71.63% 130.21% at 50% 0%,
                #aadcd6 0%,
                rgba(33, 191, 150, 0) 100%
            ),
            #21bf96;
    }

    :active {
        border-color: ${color$1.greenLight};
        background: linear-gradient(
                83.64deg,
                #aadcd6 -9.46%,
                rgba(33, 191, 150, 0) 45.97%,
                #aadcd6 103.7%
            ),
            #21bf96;
        outline: 0;
        box-shadow: none;
    }

    :focus {
        box-shadow: 0px 0px 0px 2px ${color$1.blue};
    }

    svg {
        fill: ${color$1.white};
    }
`;
var styles = {
  ButtonPrimaryStyled: ButtonPrimaryStyled$1
};
const {
  ButtonPrimaryStyled
} = styles;
const ButtonPrimary = ({
  ...props
}) => /* @__PURE__ */ jsx$2(ButtonPrimaryStyled, {
  ...props
});
export {
  ButtonPrimary as default
};
