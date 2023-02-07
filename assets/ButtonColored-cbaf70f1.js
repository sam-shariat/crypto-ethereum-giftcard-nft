import { q as Ce$1$2, s as getShade$2, t as color$3, v as styled$1$2, w as jsx$4, x as ButtonBase$1 } from "./index-946ae5ef.js";
import "./openlogin.esm-e8d3e4be.js";
import "./base.esm-570dabbe.js";
import "./elliptic-f2b24f57.js";
import "./index-2c674280.js";
import "./index-f8977440.js";
import "./url-d0ea8fe9.js";
import "./index-1b9e19c3.js";
import "./_commonjs-dynamic-modules-58f2b0ec.js";
const coloredShades = Ce$1$2`
    :after {
        background-color: ${getShade$2("light", 90)};
    }

    :hover {
        :after {
            background-color: ${getShade$2("light", 70)};
        }
    }

    :active {
        :after {
            background-color: ${getShade$2("light", 50)};
        }
    }
`;
const coloredRed = Ce$1$2`
    background-color: ${color$3.red};
    border-color: ${color$3.red};
    color: ${color$3.red};

    :focus {
        box-shadow: 0px 0px 0px 2px ${color$3.paleCerulean};
    }

    svg {
        fill: ${color$3.red};
    }

    ${coloredShades}
`;
const coloredGreen = Ce$1$2`
    background-color: ${color$3.green};
    border-color: ${color$3.green};
    color: ${color$3.green};

    :focus {
        box-shadow: 0px 0px 0px 2px ${color$3.paleCerulean};
    }

    svg {
        fill: ${color$3.green};
    }

    ${coloredShades}
`;
const coloredBlue = Ce$1$2`
    background-color: ${color$3.blue};
    border-color: ${color$3.blue};
    color: ${color$3.blue};

    :focus {
        box-shadow: 0px 0px 0px 2px ${color$3.paleCerulean};
    }

    svg {
        fill: ${color$3.blue};
    }

    ${coloredShades}
`;
const coloredYellow = Ce$1$2`
    background-color: ${color$3.yellow};
    border-color: ${color$3.yellow};
    color: ${color$3.yellow};

    :focus {
        box-shadow: 0px 0px 0px 2px ${color$3.paleCerulean};
    }

    svg {
        fill: ${color$3.yellow};
    }

    ${coloredShades}
`;
const getColored = (color2) => {
  switch (color2) {
    case "red":
      return coloredRed;
    case "green":
      return coloredGreen;
    case "blue":
      return coloredBlue;
    case "yellow":
      return coloredYellow;
    default:
      return;
  }
};
const ButtonColoredStyled$1 = styled$1$2(ButtonBase$1)`
    :after {
        background-color: ${getShade$2("dark", 0)};
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

    ${({
  color: color2
}) => color2 && getColored(color2)}
`;
var styles = {
  ButtonColoredStyled: ButtonColoredStyled$1
};
const {
  ButtonColoredStyled
} = styles;
const ButtonColored = ({
  color: color2,
  ...props
}) => /* @__PURE__ */ jsx$4(ButtonColoredStyled, {
  color: color2,
  ...props
});
export {
  ButtonColored as default
};
