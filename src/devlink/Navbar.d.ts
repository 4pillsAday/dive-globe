import * as React from "react";
import * as Types from "./types";

declare function Navbar(props: {
  as?: React.ElementType;
  navbarLinkHome?: React.ReactNode;
  navbarLinkDiveSites?: React.ReactNode;
  navbarLinkAbout?: React.ReactNode;
  navbarLinkContact?: React.ReactNode;
  buttonTextLogIn?: React.ReactNode;
  localeDropdownSlot?: Types.Devlink.Slot;
  navbarLinkDiveMap?: React.ReactNode;
  buttonTextMyAccount?: React.ReactNode;
}): React.JSX.Element;
