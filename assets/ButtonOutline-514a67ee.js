import { v as styled$1$2, t as color$3, y as gradientColors$2, w as jsx$4, x as ButtonBase$1 } from "./index-946ae5ef.js";
import "./openlogin.esm-e8d3e4be.js";
import "./base.esm-570dabbe.js";
import "./elliptic-f2b24f57.js";
import "./index-2c674280.js";
import "./index-f8977440.js";
import "./url-d0ea8fe9.js";
import "./index-1b9e19c3.js";
import "./_commonjs-dynamic-modules-58f2b0ec.js";
const ButtonOutlineStyled$1 = styled$1$2(ButtonBase$1)`
    background-color: ${color$3.white};
    border-color: ${color$3.beauBlue};
    color: ${color$3.blue};

    :hover {
        background-color: ${gradientColors$2.beauBlue};
        border-color: transparent;
        color: ${color$3.blue};

        svg {
            color: ${color$3.blue};
        }
    }

    :active {
        box-shadow: 0px 0px 0px 2px ${color$3.blueDark};
    }

    :focus {
        box-shadow: 0px 0px 0px 2px ${color$3.paleCerulean};
    }

    svg {
        color: ${color$3.blue};
    }
`;
var styles = {
  ButtonOutlineStyled: ButtonOutlineStyled$1
};
const {
  ButtonOutlineStyled
} = styles;
const ButtonOutline = ({
  ...props
}) => /* @__PURE__ */ jsx$4(ButtonOutlineStyled, {
  ...props
});
export {
  ButtonOutline as default
};
