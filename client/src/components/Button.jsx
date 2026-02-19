import "../css/components/Button.css";
import PropTypes from "prop-types";

/**
 * Button component — structure only.
 * Colors are provided by the active role theme (UserGlobal.css / AdminGlobal.css)
 * via the CSS class variants below.
 *
 * Props:
 *  - variant:  "primary" | "secondary" | "danger" | "ghost"  (default: "primary")
 *  - size:     "sm" | "md" | "lg"                            (default: "md")
 *  - fullWidth: boolean                                       (default: false)
 *  - disabled:  boolean                                       (default: false)
 *  - type:     "button" | "submit" | "reset"                 (default: "button")
 *  - onClick:  function
 *  - children: React node
 */
export default function Button({
    children,
    variant  = "primary",
    size     = "md",
    fullWidth = false,
    disabled  = false,
    type     = "button",
    onClick,
    className = "",
    ...rest
}) {
    const classes = [
        "btn",
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth ? "btn--full" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled}
            onClick={onClick}
            {...rest}
        >
            {children}
        </button>
    );
}

Button.propTypes = {
    children:  PropTypes.node.isRequired,
    variant:   PropTypes.oneOf(["primary", "secondary", "danger", "ghost"]),
    size:      PropTypes.oneOf(["sm", "md", "lg"]),
    fullWidth: PropTypes.bool,
    disabled:  PropTypes.bool,
    type:      PropTypes.oneOf(["button", "submit", "reset"]),
    onClick:   PropTypes.func,
    className: PropTypes.string,
};