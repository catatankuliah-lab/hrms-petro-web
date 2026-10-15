import { Link } from "react-router-dom";

const FullLogo = () => {
  return (
    <Link to={"/"}>
      {/* Dark Logo */}
      <img
        src="/images/logos/dark-logo.svg"
        alt="logo"
        width={135}
        height={40}
        className="block dark:hidden rtl:scale-x-[-1]"
      />
      {/* Light Logo */}
      <img
        src="/images/logos/dark-logo.svg"
        alt="logo"
        width={135}
        height={40}
        className="hidden dark:block rtl:scale-x-[-1] brightness-0 invert"
      />
    </Link>
  );
};

export default FullLogo;