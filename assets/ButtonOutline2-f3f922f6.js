import { E as styled$1$1, D as color$1, J as gradientColors, G as jsx$2, H as ButtonBase } from "./index-4b14234c.js";
import "./openlogin.esm-e718131c.js";
import "./base.esm-570dabbe.js";
import "./elliptic-f2b24f57.js";
import "./index-2c674280.js";
import "./index-f8977440.js";
import "./url-d0ea8fe9.js";
import "./index-1b9e19c3.js";
import "./_commonjs-dynamic-modules-58f2b0ec.js";
const ButtonOutlineStyled$1 = styled$1$1(ButtonBase)`
    background-color: ${color$1.white};
    border-color: ${color$1.beauBlue};
    color: ${color$1.blue};

    :hover {
        background-color: ${gradientColors.beauBlue};
        border-color: transparent;
        color: ${color$1.blue};

        svg {
            color: ${color$1.blue};
        }
    }

    :active {
        box-shadow: 0px 0px 0px 2px ${color$1.blueDark};
    }

    :focus {
        box-shadow: 0px 0px 0px 2px ${color$1.paleCerulean};
    }

    svg {
        color: ${color$1.blue};
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
}) => /* @__PURE__ */ jsx$2(ButtonOutlineStyled, {
  ...props
});
export {
  ButtonOutline as default
};
