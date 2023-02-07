import { E as styled$1$1, A as getShade, G as jsx$2, H as ButtonBase } from "./index-946ae5ef.js";
import "./openlogin.esm-e8d3e4be.js";
import "./base.esm-570dabbe.js";
import "./elliptic-f2b24f57.js";
import "./index-2c674280.js";
import "./index-f8977440.js";
import "./url-d0ea8fe9.js";
import "./index-1b9e19c3.js";
import "./_commonjs-dynamic-modules-58f2b0ec.js";
const ButtonCustomStyled$1 = styled$1$1(ButtonBase)`
    background-color: ${(p) => {
  var _a;
  return (_a = p.customize) == null ? void 0 : _a.backgroundColor;
}};

    span {
        color: ${(p) => {
  var _a;
  return (_a = p.customize) == null ? void 0 : _a.textColor;
}};
        font-size: ${(p) => {
  var _a;
  return ((_a = p.customize) == null ? void 0 : _a.fontSize) + "px";
}};
    }

    svg {
        fill: ${(p) => {
  var _a;
  return (_a = p.customize) == null ? void 0 : _a.textColor;
}};
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
        background-color: ${(p) => {
  var _a;
  return (_a = p.customize) == null ? void 0 : _a.backgroundColor;
}};

        :after {
            background-color: ${(p) => {
  var _a;
  return ((_a = p.customize) == null ? void 0 : _a.onHover) === "lighten" ? getShade("light", 20) : getShade("dark", 20);
}};
        }
    }

    :active {
        :after {
            background-color: ${(p) => {
  var _a;
  return ((_a = p.customize) == null ? void 0 : _a.onHover) === "lighten" ? getShade("light", 40) : getShade("dark", 40);
}};
        }
    }
`;
var styles = {
  ButtonCustomStyled: ButtonCustomStyled$1
};
const {
  ButtonCustomStyled
} = styles;
const ButtonCustom = ({
  customize,
  ...props
}) => {
  return /* @__PURE__ */ jsx$2(ButtonCustomStyled, {
    customize,
    ...props
  });
};
export {
  ButtonCustom as default
};
